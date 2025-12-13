import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

type CardCompactProps = {
  title: string;
  description: string;
  className?: string;
  content: React.ReactNode;
  footer?: React.ReactNode;
};

const CardCompact = ({
  title,
  description,
  className,
  content,
  footer,
}: CardCompactProps) => {
  return (
    <Card
      className={`rounded-xl border-muted/20 shadow-sm transition-all duration-300 ${className}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-primary">
          {title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
      {footer && (
        <CardFooter className="flex justify-between border-t pt-4 mt-2">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};

export { CardCompact };
