declare module "tailwindcss-rtl" {
  import type { Config } from "tailwindcss";

  const rtl: NonNullable<Config["plugins"]>[number];

  export default rtl;
}
