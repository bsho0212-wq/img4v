export enum ShotSize {
  DEFAULT = '기본 (설정 안함)',
  EXTREME_CLOSE_UP = '익스트림 클로즈업 (눈/입)',
  CLOSE_UP = '클로즈업 (얼굴 전체)',
  MEDIUM_CLOSE_UP = '미디엄 클로즈업 (어깨 위)',
  MEDIUM_SHOT = '미디엄 샷 (허리 위)',
  FULL_SHOT = '풀 샷 (전신)',
  LONG_SHOT = '롱 샷 (배경 포함)',
}

export enum CameraLevel {
  DEFAULT = '기본 (설정 안함)',
  EYE_LEVEL = '아이 레벨 (눈높이)',
  WEAK_HIGH_ANGLE = '약한 하이 앵글 (살짝 위에서)',
  HIGH_ANGLE = '하이 앵글 (위에서 아래로)',
  BIRDS_EYE = '버드 아이 뷰 (수직 조감)',
  WEAK_LOW_ANGLE = '약한 로우 앵글 (살짝 아래서)',
  LOW_ANGLE = '로우 앵글 (아래서 위로)',
  WORMS_EYE = '웜 아이 뷰 (바닥에서 위로)',
}

export enum ShotDirection {
  DEFAULT = '기본 (설정 안함)',
  FRONT_VIEW = '정면 (Front)',
  SIDE_LEFT = '측면 - 인물 기준 왼쪽 (Side Left)',
  SIDE_RIGHT = '측면 - 인물 기준 오른쪽 (Side Right)',
  QUARTER_LEFT = '45도 - 인물 기준 왼쪽 (Quarter Left)',
  QUARTER_RIGHT = '45도 - 인물 기준 오른쪽 (Quarter Right)',
  BACK_VIEW = '후면 (Back)',
}

export enum ArtStyle {
  DEFAULT = '스타일 없음',
  PHOTOREALISTIC = '실사 (Photorealistic)',
  ANIME = '애니메이션 / 만화',
  CINEMATIC = '영화 같은 (Cinematic)',
  DIGITAL_3D = '3D 디지털 아트',
  OIL_PAINTING = '유화',
  CYBERPUNK = '사이버펑크',
  VINTAGE = '빈티지 / 레트로',
  SKETCH = '연필 스케치',
}

export enum EmotionType {
  NEUTRAL = '무표정 / 중립',
  JOY = '기쁨 / 행복',
  SADNESS = '슬픔 / 비탄',
  ANGER = '분노 / 화남',
  FEAR = '공포 / 두려움',
  SURPRISE = '놀람 / 충격',
  DISGUST = '혐오 / 역겨움',
  CONFUSION = '혼란 / 당황',
  DETERMINATION = '결의 / 단호함',
  CUSTOM = '기타 (직접 입력)',
}

export enum ExpressionType {
  MATCH_INTERNAL = '내면 감정과 일치',
  STOIC = '절제된 표정 (포커페이스)',
  SUPPRESSED = '참는 표정 (감정 억제)',
  EXAGGERATED = '과장된 표정 (드라마틱)',
  SUBTLE = '미묘한 표정',
  CRYING = '우는 표정 (눈물)',
  SMILING = '웃는 표정',
  SCREAMING = '절규 / 비명',
  FROWNING = '찌푸림',
  DEADPAN = '무덤덤한 표정',
  CUSTOM = '기타 (직접 입력)',
}

export enum BackgroundMode {
  TEXT = '텍스트 설명 (기본)',
  IMAGE_COMPOSITE = '공간 합성 (이미지 속에 인물 배치)',
  IMAGE_REFERENCE = '공간 참조 (이미지 스타일/구조 참고)',
}

export interface BackgroundSettings {
  mode: BackgroundMode;
  image?: {
    base64: string;
    mimeType: string;
  };
  prompt: string;
}

export interface ActingSettings {
  internalEmotion: EmotionType;
  customInternalEmotion?: string; // For CUSTOM
  internalIntensity: number; // 1-10
  externalExpression: ExpressionType;
  customExternalExpression?: string; // For CUSTOM
  externalIntensity: number; // 1-10
}

export interface FrameSettings {
  scenePrompt: string;
  shotSize: ShotSize;
  cameraLevel: CameraLevel;
  shotDirection: ShotDirection;
  acting: ActingSettings;
  background: BackgroundSettings;
  generatedImage: string | null;
}

export interface ImageGenerationParams {
  apiKey?: string; // Optional manual key
  prompt: string;
  shotSize: ShotSize;
  cameraLevel: CameraLevel;
  shotDirection: ShotDirection;
  // Changed to array to support up to 4 images
  referenceImages?: {
    base64: string;
    mimeType: string;
  }[];
  // New field: The generated Top Image to use as context for End Image
  startFrameReference?: {
    base64: string;
    mimeType: string;
  };
  acting?: ActingSettings;
  background?: BackgroundSettings;
}

export interface GenerationResult {
  imageUrl: string | null;
  error: string | null;
}