import { redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import { pb } from "$lib/pocketbase";

export const load = async () => {
  const user = pb?.authStore?.model;

  if (user) {
    redirect(307, resolve("/home"));
  }

  return {
    user,
  };
};
