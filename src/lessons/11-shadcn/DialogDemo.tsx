// src/lessons/11-shadcn/DialogDemo.tsx
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function DialogDemo() {
    return (
        <div className="p-8">
            <Dialog>
                {/* asChild で「このButtonがトリガー」になる */}
                <DialogTrigger asChild>
                    <Button variant="destructive">削除する</Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>本当に削除しますか？</DialogTitle>
                        <DialogDescription>
                            この操作は取り消せません。
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="destructive">削除</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
