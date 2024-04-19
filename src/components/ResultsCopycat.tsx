type Props = {
  self: string;
  other: string;
  reference: string;
};

const ResultsCopycat: React.FC<Props> = ({ self, other, reference }) => (
  <div className="flex flex-row items-center justify-around">
    <div className="flex flex-col items-center gap-4">
      <p className="text-center">You drew:</p>
      <img src={self} alt="Your drawing" className="w-full" />
    </div>
    <div className="flex flex-col items-center gap-4">
      <p className="text-center">The reference image was:</p>
      <img src={reference} alt="Reference image" className="w-1/2" />
    </div>
    <div className="flex flex-col items-center gap-4">
      <p className="text-center">Your friend drew:</p>
      <img src={other} alt="Friend's drawing" className="w-full" />
    </div>
  </div>
);

export default ResultsCopycat;
