type Props = {
  left: string;
  right: string;
  reference: string;
};

const ResultsSplitDraw: React.FC<Props> = ({ left, right, reference }) => (
  <div className="flex flex-row items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <p className="text-center">The reference image was:</p>
      <img src={reference} alt="Reference image" className="w-1/2" />
    </div>
    <div className="flex flex-row justify-center items-center overflow-hidden">
      <img src={left} alt="Left drawing" />
      <img src={right} alt="Right drawing" />
    </div>
  </div>
);

export default ResultsSplitDraw;
