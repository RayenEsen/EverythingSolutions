export class LoginResponse {
  token: string = "";
  entreprise = {
    id: 0,
    nomSociete: "",
    email: "",
    telephone: ""
  };
  expiresIn: string = "";  // Or Date depending on how you want to handle it

  constructor() {}
}
