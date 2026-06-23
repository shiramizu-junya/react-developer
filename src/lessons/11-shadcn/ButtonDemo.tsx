import { Button } from "@/components/ui/button";

export function ButtonDemo() {
    return (
        <div className="p-8 flex flex-wrap gap-3 items-center">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button asChild>
                <a href="#">リンクなのにボタン (asChild)</a>
            </Button>
        </div>
    );
}
