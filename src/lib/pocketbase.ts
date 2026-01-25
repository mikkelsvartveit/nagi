import PocketBase from "pocketbase";
import type { TypedPocketBase } from "./pocketbase-typegen";

interface PocketBaseErrorData {
  [key: string]: {
    code: number | string;
    message: string;
    data: PocketBaseErrorData;
  };
}

export interface PocketBaseError {
  status: number;
  data: PocketBaseErrorData;
  url: string;
}

export const pb = new PocketBase("/") as TypedPocketBase;
