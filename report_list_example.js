const mainPage = "https://www.mainpage.com/";
const reportList = [
  {
    main: mainPage
  },
  ...[
    { "static-subpage-1": "subpage-1" },
    { "dynamic-page-example": "search/?query=something" },
  ].map(p => {
    const [k, v] = Object.entries(p)[0];
    return { [k]: mainPage + v };
  })
];

module.exports = reportList;
