import { HelmetProvider, Helmet } from "react-helmet-async";

const PageMeta = ({
  title = "Ucstaungoo",
  description = "Admin dashboard for University of Computer Studies ( Taungoo )",
}: {
  title?: string;
  description?: string;
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
  </Helmet>
);

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;
