import React from "react";

export const useNavigatorShare = (url, defaultMessage) => {
  const [messageStatus, setMessageStatus] = React.useState(null);
  // const { theme, environment, fontFamilies, importedFonts, logo } = useStore();

  const DEFAULT_MESSAGE = defaultMessage || "Copiado";

  // console.log("useNavigatorShare", { url });

  const onShare = React.useCallback(() => {
    return async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Validacion de proforma",
            url,
          });
        } catch (e) {
          await navigator.clipboard.writeText(url);
          setMessageStatus(DEFAULT_MESSAGE);
        }
        // await navigator.clipboard.writeText(url);
      } else {
        await navigator.clipboard.writeText(url);
        setMessageStatus(DEFAULT_MESSAGE);
      }
    };
  }, [url]);

  return { onShare, messageStatus, setMessageStatus };
};
