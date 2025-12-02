import { z } from "zod";

// Input schema
export const WeatherToolInputSchema = z.object({
  location: z.string().min(2, "Location must be at least 2 characters")
});

// Output schema
export const WeatherToolOutputSchema = z.object({
  content: z.string().min(5, "Weather content is too short")
});
