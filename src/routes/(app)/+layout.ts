import { pb } from "$lib/pocketbase";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = () => {
  const user = pb?.authStore?.model;

  return {
    user,
  };
};
