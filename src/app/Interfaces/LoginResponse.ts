export interface LoginResponse {
    token: string;
    entreprise: {
      id: number;
      nomSociete: string;
      email: string;
      telephone: string;
    };
    expiresIn: string;  // Or `Date` depending on how you handle it
  }
// This interface defines the structure of the login response object.
// It includes a `token` property for the JWT token, an `entreprise` object with details about the company,  