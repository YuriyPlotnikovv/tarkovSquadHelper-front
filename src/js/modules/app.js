document.addEventListener('DOMContentLoaded', function () {
  const UPDATE_INTERVAL = 10000;
  const SEARCH_DELAY = 300;
  const COOKIE_EXPIRATION_DAYS = 14;
  const DEFAULT_INVITE_BUTTON_TEXT = 'Скопировать ссылку на комнату';
  const SUCCESS_INVITE_BUTTON_TEXT = 'Ссылка успешно скопирована!';

  const DARK_THEME_CLASS = 'page__body--dark-theme';
  const LIGHT_THEME_CLASS = 'page__body--light-theme';
  const ITEM_OPEN_CLASS = 'players__item--open';
  const SEARCH_RESULTS_CLASS = 'page__search-results';

  new Vue({
    el: '#app',
    data: {
      apiBaseUrl: '',
      isDarkTheme: getCookie('theme') !== 'light',
      roomIdInput: '',
      roomId: getCookie('roomId') || '',
      nickname: getCookie('nickname') || '',
      isInRoom: !!getCookie('roomId'),
      showNicknameForm: !getCookie('nickname'),
      playersList: [],
      searchQuery: '',
      searchResults: [],
      showSearchResults: false,
      searchTimeout: null,
      isSubmitted: false,
      hasError: false,
      currentState: '',
      inviteButtonText: DEFAULT_INVITE_BUTTON_TEXT
    },
    created() {
      fetch('/config.json')
        .then(response => response.json())
        .then(config => {
          this.apiBaseUrl = config.apiBaseUrl;

          const urlParams = new URLSearchParams(window.location.search);
          const urlRoomId = urlParams.get('roomId');

          if (urlRoomId) {
            this.enterRoom(urlRoomId);
          } else if (this.roomId) {
            this.fetchItems();
          }
        })
        .catch(error => {
          console.error('Ошибка загрузки конфигурации:', error);
        });

      this.updateInterval = setInterval(() => {
        if (this.isInRoom && !this.showNicknameForm) {
          this.checkForUpdates();
        }
      }, UPDATE_INTERVAL);

      this.changeTheme();

      document.addEventListener('click', this.handleClickOutside);
    },
    beforeDestroy() {
      document.removeEventListener('click', this.handleClickOutside);
      clearInterval(this.updateInterval);
    },
    methods: {
      handleRoomEntry() {
        if (this.roomIdInput) {
          this.enterRoom(this.roomIdInput);
        } else {
          this.createRoom();
        }
      },
      createRoom() {
        const createRoomUrl = `${this.apiBaseUrl}/createCollection`;
        fetch(createRoomUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(response => response.json())
          .then(data => {
            if (data.message) {
              this.enterRoom(data.message);
            }
          })
          .catch(error => {
            console.error('Ошибка при создании комнаты:', error);
          });
      },
      enterRoom(roomId) {
        this.roomId = roomId;
        setCookie('roomId', roomId, COOKIE_EXPIRATION_DAYS);
        this.isInRoom = true;

        if (this.nickname) {
          setCookie('nickname', this.nickname, COOKIE_EXPIRATION_DAYS);
          this.showNicknameForm = false;
          this.fetchItems();
        }
      },
      submitNickname() {
        if (this.nickname !== '') {
          setCookie('nickname', this.nickname, COOKIE_EXPIRATION_DAYS);
          this.showNicknameForm = false;
          this.fetchItems();
        }
      },
      fetchItems() {
        const itemsUrl = `${this.apiBaseUrl}/getitemsFromCollection?tableName=${this.roomId}`;
        fetch(itemsUrl, {
          method: 'GET',
        })
          .then(response => response.json())
          .then(data => {
            if (data.items && data.items.length > 0) {
              this.playersList = this.groupItemsByNickname(data.items);
            } else {
              this.playersList = [];
            }

            this.$nextTick(() => {
              this.restoreListStates();
            });
          })
          .catch(error => {
            console.error('Ошибка получения предметов:', error);
          });
      },
      groupItemsByNickname(items) {
        const groupedItems = items.reduce((accumulator, item) => {
          if (!accumulator[item.nickName]) {
            accumulator[item.nickName] = {nickname: item.nickName, items: []};
          }
          accumulator[item.nickName].items.push(item);
          return accumulator;
        }, {});
        return Object.values(groupedItems);
      },
      checkForUpdates() {
        const itemsUrl = `${this.apiBaseUrl}/getitemsFromCollection?tableName=${this.roomId}`;
        fetch(itemsUrl, {
          method: 'GET',
        })
          .then(response => response.json())
          .then(newData => {
            if (newData.items && newData.items.length > 0) {
              this.compareAndUpdateItems(newData.items);
            }
          });
      },
      compareAndUpdateItems(newData) {
        const newItems = this.groupItemsByNickname(newData);

        if (JSON.stringify(this.playersList) !== JSON.stringify(newItems)) {
          this.playersList = newItems;
        }
      },
      handleSearchInput() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          this.submitSearch();
        }, SEARCH_DELAY);
      },
      submitSearch() {
        if (this.searchQuery.length > 2) {
          const searchUrl = `${this.apiBaseUrl}/search?q=${this.searchQuery}`;
          fetch(searchUrl, {
            method: 'GET',
          })
            .then(response => response.json())
            .then(data => {
              this.searchResults = data;
              this.showSearchResults = true;
            });
        } else {
          this.showSearchResults = false;
        }
      },
      addItemToRoom(item) {
        const addItemUrl = `${this.apiBaseUrl}/addItemsToCollection`;
        fetch(addItemUrl, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            tableName: this.roomId,
            item: {
              key: item.key,
              name: item.name,
              price: item.price,
              link: item.link,
              count: 1,
              nickName: this.nickname
            }
          }),
        })
          .then(response => response.json())
          .then(() => {
            this.showSearchResults = false;
            this.searchQuery = '';
            this.fetchItems();
          })
          .catch(error => {
            console.error('Ошибка добавления предмета в комнату:', error);
          });
      },
      increaseItemCount(item) {
        const increaseCountUrl = `${this.apiBaseUrl}/increaseItemCount`;
        fetch(increaseCountUrl, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            tableName: this.roomId,
            item: {key: item.key, nickName: item.nickName},
            amount: 1
          }),
        })
          .then(response => response.json())
          .then(() => {
            item.count++;
          });
      },
      decreaseItemCount(item) {
        const decreaseCountUrl = `${this.apiBaseUrl}/decreaseItemCount`;
        fetch(decreaseCountUrl, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            tableName: this.roomId,
            item: {key: item.key, nickName: item.nickName},
            amount: 1
          }),
        })
          .then(response => response.json())
          .then(() => {
            if (item.count > 0) item.count--;
          });
      },
      removeItemFromRoom(item) {
        const removeItemUrl = `${this.apiBaseUrl}/deleteItemFromCollection`;
        fetch(removeItemUrl, {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            tableName: this.roomId,
            item: {key: item.key, nickName: item.nickName}
          }),
        })
          .then(response => response.json())
          .then(() => {
            const player = this.playersList.find(player => player.nickname === item.nickName);
            player.items = player.items.filter(playerItem => playerItem.key !== item.key);
          });
      },
      handleClickOutside(event) {
        const searchResultsElement = this.$el.querySelector(`.${SEARCH_RESULTS_CLASS}`);
        if (searchResultsElement && !searchResultsElement.contains(event.target)) {
          this.showSearchResults = false;
        }
      },
      copyInviteLink() {
        const inviteLink = `${window.location.origin}${window.location.pathname}?roomId=${this.roomId}`;
        console.log(inviteLink);
        navigator.clipboard.writeText(inviteLink)
          .then(() => {
            this.inviteButtonText = SUCCESS_INVITE_BUTTON_TEXT;
            setTimeout(() => {
              this.inviteButtonText = DEFAULT_INVITE_BUTTON_TEXT;
            }, 2000);
          })
          .catch(err => {
            console.error('Ошибка копирования ссылки:', err);
          });
      },
      logout() {
        if (this.nickname) {
          deleteCookie('nickname');
          deleteCookie('roomId');
          deleteCookie('theme');

          window.location.href = window.location.origin + window.location.pathname;
        }
      },
      changeTheme() {
        const newTheme = this.isDarkTheme ? 'dark' : 'light';
        setCookie('theme', newTheme, COOKIE_EXPIRATION_DAYS);
        this.applyTheme(newTheme);
      },
      applyTheme(theme) {
        if (theme === 'dark') {
          document.body.classList.add(DARK_THEME_CLASS);
          document.body.classList.remove(LIGHT_THEME_CLASS);
        } else {
          document.body.classList.add(LIGHT_THEME_CLASS);
          document.body.classList.remove(DARK_THEME_CLASS);
        }
      },
      toggleList(evt) {
        const currentItem = evt.currentTarget;
        const nickname = currentItem.querySelector('.players__item-title').textContent;

        if (evt.target.tagName.toLowerCase() === 'h3' || evt.target === currentItem) {
          currentItem.classList.toggle(ITEM_OPEN_CLASS);

          const isOpen = currentItem.classList.contains(ITEM_OPEN_CLASS);
          setCookie(`listState_${nickname}`, isOpen, COOKIE_EXPIRATION_DAYS);
        }
      },
      restoreListStates() {
        this.playersList.forEach(player => {
          const isOpen = getCookie(`listState_${player.nickname}`) === 'true';
          const listItem = this.$el.querySelector(`[data-nickname="${player.nickname}"]`);

          if (listItem && isOpen) {
            listItem.classList.add(ITEM_OPEN_CLASS);
          }
        });
      }
    }
  });
});
