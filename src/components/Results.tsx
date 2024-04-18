type Props = {
  left: string;
  right: string;
};

const Results: React.FC<Props> = ({ left, right }) => (
  <div className="flex flex-row items-center justify-center">
    <img src={left} alt="Left drawing" />
    <img src={right} alt="Right drawing" />
  </div>
);

export default Results;
