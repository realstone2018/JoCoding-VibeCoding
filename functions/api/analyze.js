export async function onRequestPost(context) {
  const { request, env } = context

  if (!env.OPENAI_API_KEY) {
    return Response.json({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' }, { status: 500 })
  }

  let formData
  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: '요청 데이터를 파싱할 수 없습니다.' }, { status: 400 })
  }

  const photo = formData.get('photo')
  const height = formData.get('height')
  const weight = formData.get('weight')

  if (!photo || !height || !weight) {
    return Response.json({ error: '사진, 키, 몸무게를 모두 입력해주세요.' }, { status: 400 })
  }

  // 이미지를 base64로 변환 (청크 처리로 스택 오버플로 방지)
  const arrayBuffer = await photo.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  const chunkSize = 8192
  let binary = ''
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    binary += String.fromCharCode(...uint8Array.slice(i, i + chunkSize))
  }
  const base64Image = btoa(binary)
  const mimeType = photo.type || 'image/jpeg'
  const bmi = (weight / ((height / 100) ** 2)).toFixed(1)

  const systemInstruction = `당신은 10년 경력의 전문 퍼스널 스타일리스트입니다.
사용자의 사진과 신체 정보를 분석하여 맞춤형 스타일 컨설팅 보고서를 작성해주세요.
반드시 아래 JSON 구조로만 응답하세요:

{
  "bodyType": "체형명 (예: 역삼각형, 직사각형, 모래시계, 배형 등)",
  "bodyTypeDesc": "이 체형의 특징과 장점을 설명하는 2~3문장",
  "bmi": {
    "value": <숫자>,
    "category": "저체중/정상/과체중/비만 중 하나"
  },
  "colorPalette": {
    "recommended": ["어울리는 색상1", "색상2", "색상3", "색상4"],
    "avoid": ["피해야 할 색상1", "색상2"]
  },
  "styleKeywords": ["스타일 키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
  "recommendations": [
    { "category": "상의", "tip": "구체적인 추천 내용" },
    { "category": "하의", "tip": "구체적인 추천 내용" },
    { "category": "아우터", "tip": "구체적인 추천 내용" },
    { "category": "신발", "tip": "구체적인 추천 내용" },
    { "category": "액세서리", "tip": "구체적인 추천 내용" }
  ],
  "avoidItems": ["피해야 할 스타일/아이템1", "아이템2", "아이템3"],
  "overallAdvice": "전반적인 스타일 방향과 자신감을 높이는 조언 3~4문장"
}`

  let aiResponse
  try {
    aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        input: [
          {
            role: 'developer',
            content: [
              {
                type: 'input_text',
                text: systemInstruction,
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_image',
                image_url: `data:${mimeType};base64,${base64Image}`,
              },
              {
                type: 'input_text',
                text: `키: ${height}cm / 몸무게: ${weight}kg / BMI: ${bmi}`,
              },
            ],
          },
        ],
        store: false,
      }),
    })
  } catch (err) {
    return Response.json({ error: 'OpenAI API 요청 중 네트워크 오류가 발생했습니다.' }, { status: 502 })
  }

  if (!aiResponse.ok) {
    const errBody = await aiResponse.json().catch(() => ({}))
    const message = errBody?.error?.message || `OpenAI 오류 (${aiResponse.status})`
    return Response.json({ error: message }, { status: aiResponse.status })
  }

  const data = await aiResponse.json()

  // Responses API: output 배열에서 output_text 타입의 텍스트 추출
  const outputText = data.output
    ?.flatMap(item => item.content || [])
    ?.find(c => c.type === 'output_text')
    ?.text

  if (!outputText) {
    return Response.json({ error: 'AI 응답을 받지 못했습니다.' }, { status: 500 })
  }

  let report
  try {
    // 마크다운 코드블록이 포함된 경우 JSON 부분만 추출
    const match = outputText.match(/```json\s*([\s\S]*?)```/) || outputText.match(/(\{[\s\S]*\})/)
    const jsonStr = match ? (match[1] || match[0]) : outputText
    report = JSON.parse(jsonStr.trim())
  } catch {
    return Response.json({ error: 'AI 응답을 파싱할 수 없습니다.' }, { status: 500 })
  }

  return Response.json({ success: true, report })
}
