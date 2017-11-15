Page({
  data: {
    product: [
      {
        version: ['v1.8.0'],
        name: 'search all repository',
        date: '2017-07-21',
        status: 1,
      },
      {
        version: ['v1.7.0'],
        name: 'add profile\'s events',
        date: '2017-07-09',
        status: 1,
      },
      {
        version: ['v1.6.0'],
        name: 'add pull request; optimization search-bar,tab-bar; add plan page',
        date: '2017-06-26',
        status: 1,
      },
      {
        version: ['v1.6.0'],
        name: 'add pull request; optimization search-bar,tab-bar; add plan page',
        date: '2017-06-26',
        status: 1,
      },
      {
        version: ['v1.5.1'],
        name: 'add loadmore; add pager in commits,events page',
        date: '2017-06-23',
        status: 1,
      },
      {
        version: ['v1.5.0'],
        name: 'add branch page; add commits(include commit-item) page',
        date: '2017-06-18',
        status: 1,
      },
      {
        version: ['v1.4.2'],
        name: 'fix URI malformed; optimize wemark UI; add previewImage in issue',
        date: '2017-06-12',
        status: 1,
      },
      {
        version: ['v1.4.1'],
        name: 'add issue-item page',
        date: '2017-06-09',
        status: 1,
      },
      {
        version: ['v1.4.0'],
        name: 'add issues page',
        date: '2017-06-05',
        status: 1,
      },
      {
        version: ['v1.3.0'],
        name: 'add events,profile page',
        date: '2017-06-05',
        status: 1,
        // 1.3.0审核过长，1.4.0直接当天审完
      },
      {
        version: ['v1.2.0'],
        name: 'add repository,readme page; add share func',
        date: '2017-06-01',
        status: 1,
      },
      {
        version: ['v1.1.0'],
        name: 'use trending language-select page; use api by codehub',
        date: '2017-05-24',
        status: 1,
      },
      {
        version: ['v1.0.1'],
        name: 'add trending language',
        date: '2017-05-19',
        status: 1,
      },
      {
        version: ['v1.0.0'],
        name: 'init trending',
        date: '2017-05-16',
        status: 1,
      },
    ],
    plan: [
      {
        version: ['v1.9.0'],
        name: 'add profile\'s repository',
        status: 1,
      }
    ],
    future: [
      {
        version: ['v2.x.x'],
        name: 'wexin bind github',
        status: 1,
      },
      {
        version: ['v2.x.x'],
        name: 'view code',
        status: 1,
      }
    ]
  },
  onLoad({ user }) {
    wx.setNavigationBarTitle({
      title: 'Github Plan',
    });
  }
})