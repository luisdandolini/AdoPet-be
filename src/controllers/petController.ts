import { Request, Response } from "express";
import Pet from "../models/Pet";

interface AuthenticatedRequest extends Request {
  userId?: number;
}

export const registerPet = async (req: AuthenticatedRequest, res: Response) => {
  const { type, race, name, weight, size, age, adopted_at } = req.body;

  if (!type || !race || !name || !weight || !size || !age || !adopted_at) {
    return res.status(400).send("Todos os campos são obrigatórios.");
  }

  try {
    const [day, month, year] = adopted_at.split("/");
    const formattedDate = `${year}-${month}-${day}`;

    const newPet = await Pet.create({
      user_id: req.userId!,
      type,
      race,
      name,
      weight,
      size,
      age,
      adopted_at: formattedDate,
    });

    res
      .status(201)
      .json({ message: "Pet registrado com sucesso!", pet: newPet });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao registrar o pet.");
  }
};
