const Heading = ({ title }) => {
  return (
   <div className="mb-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
      {/* {subtitle && <p className="text-lg text-foreground/60">{subtitle}</p>} */}
    </div>
  );
};

export default Heading;