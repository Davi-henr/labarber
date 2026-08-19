declare namespace Express {
  export interface Request {
    user: {
      id: string;
      role: string;
      barbearia_id: string;
    };
    superAdmin?: {
      id: string;
    };
  }
}
