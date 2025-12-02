import { z } from "zod";

export const OutfitToolInputSchema = z.object({
  weather: z.object({
    main: z.object({ temp: z.number() }),
    weather: z.array(z.object({ main: z.string() }))
  })
});

export const OutfitToolOutputSchema = z.object({
  suggestion: z.string().min(5)
});
