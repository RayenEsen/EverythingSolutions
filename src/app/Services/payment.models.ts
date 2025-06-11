export interface PaymentRequest {
  amount: number;
  entrepriseId: number;
}

export interface PaymentCreateResponse {
  status: boolean;
  message: string;
  code: number;
  data: {
    paymentUrl: string;
  };
} 