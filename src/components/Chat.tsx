import clsx from "clsx";

type Props = {
  messages: { text: string; self: boolean }[];
  sendMessage: (message: string) => void;
};

const Chat: React.FC<Props> = ({ messages, sendMessage }) => (
  <div className="flex flex-col min-w-72">
    <p className="font-bold">Chat</p>
    <div className="h-80 bg-white overflow-scroll">
      {messages.map(({ text, self }, index) => (
        <p
          key={index}
          className={clsx("p-2 text-sm text-black", {
            "text-right": self,
            "text-left": !self,
            "bg-gray-300": self,
            "bg-gray-400": !self,
          })}
        >
          {text}
        </p>
      ))}
    </div>
    <input
      className="border border-gray-400 p-2 text-black"
      placeholder="Type your message..."
      onKeyDown={(e) => {
        const target = e.target as HTMLInputElement;
        if (e.key === "Enter") {
          sendMessage(target.value);
          target.value = "";
        }
      }}
    />
  </div>
);

export default Chat;
