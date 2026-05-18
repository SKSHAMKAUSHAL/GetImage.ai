export interface PreviewResponse {
  success: boolean;
  image_url?: string;
  enhanced_prompt?: string;
  warning?: string;
  message?: string;
}

export interface HQResponse {
  success: boolean;
  image_url?: string;
  message?: string;
}

export interface GenerateResponse {
  success: boolean;
  image_url?: string;
  enhanced_prompt?: string;
  warning?: string;
  message?: string;
}
