import PocketBase from "pocketbase";
import type { TypedPocketBase } from "./pocketbase-typegen";

export const pb = new PocketBase("/") as TypedPocketBase;
