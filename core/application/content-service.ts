import type { HomeContent } from "@/core/domain/entities";
import { getHomeContent } from "@/infrastructure/repositories/content-repository";

export async function loadHomePage(): Promise<HomeContent> {
  return getHomeContent();
}
