import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

type Testimonial = {
  id: string;
  quote: string;
  role: "player" | "sponsor" | "coach";
  rating: number | null;
  name: string | null;
  org: string | null;
  media_url: string | null;
  tags: string[] | null;
};

type TestimonialsCarouselProps = {
  testimonials: Testimonial[];
};

const roleLabel: Record<Testimonial["role"], string> = {
  player: "Player",
  sponsor: "Sponsor",
  coach: "Coach / Club",
};

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const slides = useMemo(() => testimonials.slice(0, 10), [testimonials]);

  if (slides.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Latest wins from our community</h3>
      <Carousel className="w-full">
        <CarouselContent className="items-stretch">
          {slides.map((item) => (
            <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
              <Card className="h-full">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{roleLabel[item.role]}</Badge>
                    {item.rating != null && (
                      <span className="text-amber-500 font-semibold">★ {item.rating}/10</span>
                    )}
                  </div>
                  <blockquote className="text-base leading-relaxed">“{item.quote}”</blockquote>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {item.name ? item.name : "Verified member"}
                    {item.org ? ` · ${item.org}` : null}
                  </div>
                  {item.tags && (
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {item.media_url && (
                    <video
                      src={item.media_url}
                      controls
                      className="mt-3 w-full rounded-md border"
                      preload="metadata"
                      height={160}
                    />
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
