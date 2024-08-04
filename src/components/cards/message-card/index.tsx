type MessageCardProps = {
    username: string;
    content: string;
};
export default function MessageCard({ username, content }: MessageCardProps) {
    return (
        <div className="flex flex-col gap-0.5">
            <div>
                <span className="font-semibold">{username}</span>
            </div>
            <div>
                <p className="text-sm">{content}</p>
            </div>
        </div>
    );
}