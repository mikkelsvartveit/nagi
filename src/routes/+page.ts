import { pb } from "$lib/pocketbase";
import type { PageLoad } from "./$types";

export const load: PageLoad = () => {
  const user = pb?.authStore?.model;

  return {
    user,
  };
};
