import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function KitPage() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto space-y-12">
      <div className="bg-turmeric/20 text-turmeric-deep p-4 rounded-lg font-bold">
        Development preview — not user data
      </div>
      
      <section className="space-y-4">
        <h2 className="font-display text-3xl">Buttons</h2>
        <div className="flex gap-4 items-center">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="quiet">Quiet Button</Button>
        </div>
        <div className="flex gap-4 items-center">
          <Button variant="primary" size="big">Big Primary</Button>
          <Button variant="secondary" size="big">Big Secondary</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-3xl">Cards</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Protection Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This is a basic card for the UI.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-3xl">Empty States</h2>
        <EmptyState 
          title="Nothing here yet"
          description="We couldn't find any recent advisories for this region."
          action={<Button variant="secondary">Check again</Button>}
        />
      </section>
    </div>
  );
}
