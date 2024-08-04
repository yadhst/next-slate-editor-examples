import MessageCard from "@/components/cards/message-card";

const messages = [
    {
        username: "Kevin Dewantara",
        content:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Odit facilis accusamus ducimus adipisci excepturi cumque numquam, ab id perspiciatis perferendis itaque enim vel velit, corrupti similique eius? Ullam, odio iusto.",
    },
    {
        username: "Bagas Ragunan",
        content:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Odit facilis accusamus ducimus adipisci excepturi cumque numquam, ab id perspiciatis perferendis itaque enim vel velit, corrupti similique eius? Ullam, odio iusto.",
    },
    {
        username: "Agustiano Valentino",
        content:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Odit facilis accusamus ducimus adipisci excepturi cumque numquam, ab id perspiciatis perferendis itaque enim vel velit, corrupti similique eius? Ullam, odio iusto.",
    },
];

export default function Home() {
    return (
        <div className="mx-4 my-4 flex max-w-2xl flex-col gap-10 sm:mx-auto">
            <div className="flex flex-col gap-4">
                {messages.map((message, index) => (
                    <MessageCard key={`message-${index}`} {...message} />
                ))}
            </div>
        </div>
    );
}
