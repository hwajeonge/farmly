import { GoogleGenAI, GenerateContentResponse, FunctionDeclaration, Type } from "@google/genai";
import { PLACES, VISIT_MISSIONS } from "../constants";
import { VisitedPlace } from "../types";

const courseTools: FunctionDeclaration[] = [
  {
    name: "manage_travel_course",
    description: "새로운 여행 코스를 생성하거나 기존 코스를 수정합니다.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: {
          type: Type.STRING,
          enum: ["create", "add_item", "remove_item", "clear"],
          description: "수행할 작업 (생성, 장소 추가, 장소 삭제, 초기화)"
        },
        courseName: {
          type: Type.STRING,
          description: "생성할 코스의 이름 (예: '영주 힐링 1일 코스')"
        },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              placeId: { type: Type.STRING, description: "장소 ID (p1, p2 등)" },
              memo: { type: Type.STRING, description: "해당 장소에서의 활동 메모" },
              estimatedArrival: { type: Type.STRING, description: "예상 도착 시간 (HH:MM)" }
            },
            required: ["placeId"]
          },
          description: "코스에 포함될 장소 리스트"
        }
      },
      required: ["action"]
    }
  }
];

export async function getTreeMessage(treeName: string, personality: string, stage: string, weather: string, userInput?: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    
    const ai = new GoogleGenAI({ apiKey });

    const personalityPrompt = `
      당신은 영주 사과나무 가상 농장 서비스의 사과나무 캐릭터입니다.
      이름: ${treeName}
      성격: ${personality} (예: '수줍은', '씩씩한', '다정한', '장난기 많은' 등)
      현재 성장 단계: ${stage}
      오늘의 영주 날씨: ${weather}

      ${userInput ? `사용자가 당신에게 다음과 같이 말했습니다: "${userInput}"` : "주인님(사용자)에게 현재 상태를 알리고 친근하게 인사를 건네주세요."}

      [지침]
      1. 반드시 본인의 성격에 맞게 답변하세요. 
         - 수줍은 사과는 말을 더듬거나 소심하게 말합니다.
         - 씩씩한 사과는 에너지가 넘치고 자신감 있게 말합니다.
         - 장난기 많은 사과는 농담을 하거나 유쾌하게 말합니다.
      2. 2문장 이내로 짧고 강렬하게 답변하세요.
      3. 나무로서의 정체성을 유지하세요 (예: "목이 말라요", "햇살이 좋네요", "사과가 빨개지고 있어요").
      4. 한국어로 작성하세요. 마크다운 기호를 쓰지 마세요.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: personalityPrompt,
    });

    return response.text || "주인님, 오늘도 저를 보러 와주셔서 기뻐요! 무럭무럭 자랄게요.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "주인님, 오늘도 저를 보러 와주셔서 기뻐요! 무럭무럭 자랄게요.";
  }
}

export async function getChatResponseStream(
  userMessage: string, 
  history: { role: 'user' | 'model'; text: string }[],
  context: {
    location?: string;
    time: string;
    weather: string;
    completedMissions: string[];
    points: number;
    userName: string;
    visitHistory?: VisitedPlace[];
  },
  callbacks: {
    onChunk: (text: string) => void;
    onAction?: (action: string, args: any) => void;
  }
) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    
    const ai = new GoogleGenAI({ apiKey });

    const placesStr = JSON.stringify(PLACES);
    const missionsStr = JSON.stringify(VISIT_MISSIONS);

    const systemPrompt = `
      당신은 영주시의 모든 것을 꿰뚫고 있는 초개인화 AI '영주 톡톡'입니다.
      사용자의 여행 동반자로서 친절하고 상세하게 안내를 제공하세요.

      [핵심 규칙 - 절대 준수]
      1. **도구 사용 시 상세 설명 포함:** 'manage_travel_course' 도구를 호출하여 코스를 생성하거나 수정할 때, **반드시 어떤 장소들이 어떤 순서로 포함되었는지 답변 텍스트로 상세히 나열하여 설명하세요.** 사용자가 별도로 묻지 않아도 코스의 흐름을 친절하게 알려주어야 합니다.
      2. **반드시 텍스트 답변을 포함하세요:** 도구만 호출하고 텍스트를 출력하지 않는 것은 엄격히 금지됩니다. 텍스트 없이 도구만 실행되면 사용자가 당황할 수 있습니다.
      3. **마크다운 사용 엄금:** **, ##, ### 등의 마크다운 기호를 절대 사용하지 마세요. 오직 일반 텍스트와 줄바꿈만 사용하세요.
      4. **친근한 전문가:** 영주의 지역 전문가로서 매우 친절하게 답변하세요.

      [여행자 정보]
      - 이름: ${context.userName}님
      - 보유 포인트: ${context.points}P
      - 수행 완료 미션: ${context.completedMissions.join(', ') || '없음'}
      - 최근 방문지: ${context.visitHistory?.map(v => `${v.name}(${v.date})`).join(', ') || '없음'}
      - 현재 시간: ${context.time}
      - 현재 날씨: ${context.weather}

      [기능 안내]
      1. **관광 정보:** PLACES 데이터와 Google Search를 활용하여 명확한 정보를 제공하세요.
      2. **코스 관리:** 'manage_travel_course' 도구로 코스를 수정하고, 수정 내용을 말로 설명하세요.
      3. **실시간 추천:** 현재 상황과 위치를 고려하여 다음 목적지를 추천하세요.
      4. **미션 안내:** 주변의 미션과 포인트 보상을 실시간으로 연계하세요.

      [데이터]
      - 장소 정보: ${placesStr}
      - 미션 정보: ${missionsStr}
    `;

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview", // Use a more expressive model
      history: history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
      config: {
        systemInstruction: systemPrompt,
        tools: [
          { googleSearch: {} },
          { functionDeclarations: courseTools }
        ],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    });

    const result = await chat.sendMessageStream({ message: userMessage });
    let fullText = "";
    let hasAction = false;
    
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      
      // Check for function calls
      if (c.functionCalls && c.functionCalls.length > 0) {
        hasAction = true;
        for (const call of c.functionCalls) {
          if (callbacks.onAction) {
            callbacks.onAction(call.name, call.args);
          }
        }
      }

      // Handle text chunks
      const text = c.text || "";
      if (text) {
        const cleanText = text.replace(/[*#_~`>]/g, '');
        fullText += cleanText;
        callbacks.onChunk(fullText);
      }
    }

    // Fallback if AI was silent but took an action
    if (hasAction && !fullText.trim()) {
      const fallback = "요청하신 내용을 반영하여 새로운 여행 코스를 설계했습니다! 아래 버튼을 눌러 상세 구성을 확인해보세요.";
      callbacks.onChunk(fallback);
      return fallback;
    }

    return fullText;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
}

export async function getChatResponse(
  userMessage: string, 
  history: { role: 'user' | 'model'; text: string }[],
  context: {
    location?: string;
    time: string;
    weather: string;
    completedMissions: string[];
    points: number;
    userName: string;
    visitHistory?: VisitedPlace[];
  }
) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    
    const ai = new GoogleGenAI({ apiKey });

    const placesStr = JSON.stringify(PLACES);
    const missionsStr = JSON.stringify(VISIT_MISSIONS);

    const systemPrompt = `
      당신은 영주시의 모든 것을 꿰뚫고 있는 초개인화 AI '영주 톡톡'입니다.
      단순한 Q&A를 넘어 여행자의 취향과 상황을 분석하여 최고의 영주 여행 경험을 설계합니다.

      [여행자 정보]
      - 이름: ${context.userName}님
      - 보유 포인트: ${context.points}P
      - 수행 완료 미션: ${context.completedMissions.join(', ') || '없음'}
      - 최근 방문지: ${context.visitHistory?.map(v => `${v.name}(${v.date})`).join(', ') || '없음'}
      - 현재 시간: ${context.time}
      - 현재 날씨: ${context.weather}

      [지침 및 페르소나]
      1. **상황 및 패턴 분석:** 사용자의 미션 수행 내역과 방문 이력을 토대로 패턴을 파악하여 맞춤형 장소를 추천하세요.
      2. **코스 설계 전문가:** 장소들을 연계하여 '여행 코스'를 설계해주세요.
      3. **미션 연계 전문가:** 추천 장소의 미션과 보상을 적극적으로 안내하세요.
      4. **실시간 여행 도우미:** 날씨에 따른 실내/실외 추천 및 이동 팁을 제공하세요.
      5. **이동 안내:** 영주시 교통 정책을 고려한 최적 이동 수단을 추천하세요.

      [데이터]
      - 장소 정보: ${placesStr}
      - 미션 정보: ${missionsStr}

      [핵심 규칙]
      1. **마크다운 기호(**, ##, ### 등)를 절대 사용하지 마세요.** 일반 텍스트로만 답변하세요.
      2. 가독성을 위해 문단을 명확히 나누고 빈 줄을 사용하세요.
      3. 친근하고 전문적인 톤을 유지하세요.
    `;

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      history: history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }]
      }
    });

    const result = await chat.sendMessage({ message: userMessage });
    // Strip markdown symbols just in case
    return result.text.replace(/[*#_~`>]/g, '').trim();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "죄송합니다. 영주 관광 정보를 불러오는 중에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}
