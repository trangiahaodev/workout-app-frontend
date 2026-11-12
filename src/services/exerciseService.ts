import axiosClient from "../api/axiosClient";
import { Exercise } from "../types";

export const getExerciseById = async (id: string): Promise<Exercise> => {
  return await axiosClient.get(`/exercises/${id}`);
};
