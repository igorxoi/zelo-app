import { PageHeader } from "@/components/PageHeader";

type Props = {
  title: string;
  onBackPress?: () => void;
  hideBack?: boolean;
};

export function BackHeader({ title, onBackPress, hideBack = false }: Props) {
  return (
    <PageHeader title={title} onBack={onBackPress} showBackButton={!hideBack} />
  );
}
