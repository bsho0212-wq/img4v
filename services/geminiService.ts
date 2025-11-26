import { GoogleGenAI } from "@google/genai";
import { ImageGenerationParams, ShotSize, CameraLevel, ShotDirection, GenerationResult, ExpressionType, BackgroundMode, EmotionType } from "../types";

const MODEL_NAME = 'gemini-2.5-flash-image';

export const generateImageWithNanoBanana = async (params: ImageGenerationParams): Promise<GenerationResult> => {
  try {
// 🔑 로컬스토리지에서 API 키를 읽어오는 헬퍼 (파일 맨 위에 정의됨)
const getApiKey = () => {
  const key = localStorage.getItem("GEMINI_API_KEY");
  if (!key) {
    throw new Error("API Key is missing. Please enter your Gemini API Key in the settings.");
  }
  return key;
};

// 수정된 부분
const apiKey = params.apiKey || getApiKey();  // 환경변수 대신 getApiKey() 사용
const ai = new GoogleGenAI({ apiKey });
  

    // Base Prompt Construction
    let finalPrompt = params.prompt;
    const modifiers: string[] = [];
    const parts: any[] = [];
    let imageIndexCounter = 0;

    // --- 0. Image Input Processing & Prompting ---
    
    // A. Character Reference Images (Identity Block)
    let identityBlockCount = 0;
    if (params.referenceImages && params.referenceImages.length > 0) {
        params.referenceImages.forEach(img => {
            parts.push({
                inlineData: {
                    data: img.base64,
                    mimeType: img.mimeType,
                }
            });
            imageIndexCounter++;
            identityBlockCount++;
        });
        
        modifiers.push(`\n*** IDENTITY BLOCK / CHARACTER CONSISTENCY RULES ***`);
        modifiers.push(`- The FIRST ${identityBlockCount} image(s) provided are the "Identity Block" (Character Reference Sheet).`);
        modifiers.push(`- STRICTLY MAINTAIN the character's facial features, skull structure, hair design, and body proportions from these reference images.`);
        modifiers.push(`- DO NOT CHANGE THE FACE IDENTITY. The subject in the generated image must look exactly like the reference subject.`);
    }

    // B. Start Frame Reference (Context for End Frame)
    let hasStartFrameRef = false;
    if (params.startFrameReference) {
        parts.push({
            inlineData: {
                data: params.startFrameReference.base64,
                mimeType: params.startFrameReference.mimeType,
            }
        });
        imageIndexCounter++;
        hasStartFrameRef = true;
        
        modifiers.push(`\n*** SEQUENTIAL CONTEXT (START FRAME) ***`);
        modifiers.push(`- The Image #${imageIndexCounter} is the "Top Image" (Start Frame) of this video sequence.`);
        modifiers.push(`- The goal is to generate the "End Frame" that follows this Start Frame.`);
        modifiers.push(`- Maintain continuity in lighting, clothing, and environment from this Start Frame, but progress the action/expression as described.`);
    }

    // C. Background Reference
    let hasBgRef = false;
    if (params.background && params.background.image && params.background.mode !== BackgroundMode.TEXT) {
        parts.push({
            inlineData: {
                data: params.background.image.base64,
                mimeType: params.background.image.mimeType,
            }
        });
        imageIndexCounter++;
        hasBgRef = true;
    }

    // --- 1. Camera & Composition (Detailed Mapping) ---
    if (params.shotSize !== ShotSize.DEFAULT) {
      modifiers.push(`Shot Size: ${params.shotSize}`);
    }
    
    // Granular Camera Level Logic
    if (params.cameraLevel !== CameraLevel.DEFAULT) {
        switch (params.cameraLevel) {
            case CameraLevel.EYE_LEVEL:
                modifiers.push("Camera Angle: Eye Level (Neutral perspective, lens parallel to the ground).");
                break;
            case CameraLevel.WEAK_HIGH_ANGLE:
                modifiers.push("Camera Angle: Weak High Angle (Camera is slightly above the subject's eye level, looking down approx 15-20 degrees).");
                break;
            case CameraLevel.HIGH_ANGLE:
                modifiers.push("Camera Angle: High Angle (Camera is significantly above the subject, looking down approx 45 degrees).");
                break;
            case CameraLevel.BIRDS_EYE:
                modifiers.push("Camera Angle: Bird's Eye View (Directly overhead, looking straight down at 90 degrees).");
                break;
            case CameraLevel.WEAK_LOW_ANGLE:
                modifiers.push("Camera Angle: Weak Low Angle (Camera is slightly below the subject's eye level, looking up approx 15-20 degrees).");
                break;
            case CameraLevel.LOW_ANGLE:
                modifiers.push("Camera Angle: Low Angle (Camera is significantly below the subject, looking up approx 45 degrees).");
                break;
            case CameraLevel.WORMS_EYE:
                modifiers.push("Camera Angle: Worm's Eye View (Camera is on the ground level, looking straight up).");
                break;
            default:
                modifiers.push(`Camera Angle: ${params.cameraLevel}`);
        }
    }

    if (params.shotDirection !== ShotDirection.DEFAULT) {
      modifiers.push(`Subject Direction: ${params.shotDirection}`);
    }

    // --- 2. Acting & Performance ---
    if (params.acting) {
        const { internalEmotion, internalIntensity, externalExpression, externalIntensity, customInternalEmotion, customExternalExpression } = params.acting;
        
        const iEmotion = internalEmotion === EmotionType.CUSTOM ? customInternalEmotion : internalEmotion;
        const eExpression = externalExpression === ExpressionType.CUSTOM ? customExternalExpression : externalExpression;

        modifiers.push(`\n*** ACTING & PERFORMANCE INSTRUCTIONS ***`);
        modifiers.push(`- Internal Emotion: ${iEmotion} (Intensity: ${internalIntensity}/10).`);
        
        if (externalExpression === ExpressionType.MATCH_INTERNAL) {
            modifiers.push(`- Visible Expression: Fully externally expressing the internal ${iEmotion} with intensity ${externalIntensity}/10.`);
        } else {
             modifiers.push(`- Visible Expression: ${eExpression} (Intensity: ${externalIntensity}/10).`);
             modifiers.push(`- ACTING NUANCE: The character feels ${iEmotion} internally, but is physically showing ${eExpression}. Capture this micro-expression or tension.`);
        }
        
        modifiers.push(`- RULE: Change the facial muscles to match the expression, but DO NOT morph the facial structure or bone structure. Keep identity constant.`);
    }

    // --- 3. Background & Space ---
    if (params.background) {
        const { mode, prompt: bgPrompt } = params.background;
        
        modifiers.push(`\n*** BACKGROUND & ENVIRONMENT INSTRUCTIONS ***`);
        if (bgPrompt) {
            modifiers.push(`- Environment Description: ${bgPrompt}`);
        }

        if (hasBgRef) {
            if (mode === BackgroundMode.IMAGE_COMPOSITE) {
                modifiers.push(`- The Image #${imageIndexCounter} (Last Image) is the TARGET BACKGROUND/LOCATION.`);
                modifiers.push(`- TASK: Place the character from the Identity Block into this location.`);
                modifiers.push(`- Maintain the lighting and perspective of this background image.`);
            } else if (mode === BackgroundMode.IMAGE_REFERENCE) {
                 modifiers.push(`- The Image #${imageIndexCounter} (Last Image) is a STYLE/ARCHITECTURE REFERENCE.`);
                 modifiers.push(`- Generate a new background that mimics the style, mood, and architectural details of this reference.`);
            }
        }
    }

    // Combine all modifiers
    if (modifiers.length > 0) {
      finalPrompt += `\n\n${modifiers.join('\n')}`;
    }

    // Add Text Prompt at the end
    parts.push({ text: finalPrompt });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      throw new Error("No content generated.");
    }

    let imageUrl: string | null = null;

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mimeType};base64,${base64EncodeString}`;
        break; 
      }
    }

    if (!imageUrl) {
        const textPart = candidate.content.parts.find(p => p.text);
        if (textPart) {
             console.warn("Model returned text:", textPart.text);
             throw new Error(`Model returned text output: ${textPart.text.substring(0, 100)}...`);
        }
        throw new Error("Model did not return an image.");
    }

    return { imageUrl, error: null };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return { 
      imageUrl: null, 
      error: error.message || "An unexpected error occurred." 
    };
  }
};
