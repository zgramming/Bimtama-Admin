const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const convertRoutePathToArray = (pathname: string): string[] => {
  return pathname
    .split("/")
    .filter((route) => route.length !== 0)
    .map((route) => {
      const split = route.split("_");

      /// Route => user_group become User Group
      if (split.length > 1) {
        const capitalizeName = split.map(
          (val) => (val[0]?.toUpperCase() ?? "default") + val.slice(1)
        );

        return capitalizeName.join(" ");
      }

      return route;
    });
};

const convertObjectIntoQueryParams = (queryParam: any) => {
  if (!queryParam) return "";

  const params =
    "?" +
    Object.keys(queryParam)
      .map((key) => key + "=" + queryParam[key])
      .join("&");

  return params;
};

export { sleep, convertRoutePathToArray, convertObjectIntoQueryParams };
