const matchesMock = {
  data: [
    {
      id: 'LA1_1751384912',
      platform: 'la1',
      queue: {
        id: 420,
        name: 'Ranked Solo/Dúo',
      },
      started_at: '2026-09-26T14:02:00Z',
      duration_seconds: 709,
      champion: 'Lillia',
      position: 'JUNGLE',
      win: false,
      kills: 0,
      deaths: 0,
      assists: 1,
      kda: 1.0,
      cs: 62,
      cs_per_min: 5.2,
      damage_to_champions: 1048,
      vision_score: 1,
      remake: false,
    },
  ],
  links: {
    first: null,
    last: null,
    prev: null,
    next: null,
  },
  meta: {
    current_page: 1,
    from: 1,
    last_page: 1,
    links: [
      {
        url: null,
        label: '&laquo; Previous',
        active: false,
      },
      {
        url: 'http://recall-api.aime.test/api/v1/matches?page=1',
        label: '1',
        active: true,
      },
      {
        url: null,
        label: 'Next &raquo;',
        active: false,
      },
    ],
    path: 'http://recall-api.aime.test/api/v1/matches',
    per_page: 15,
    to: 1,
    total: 1,
  },
}

export default matchesMock
