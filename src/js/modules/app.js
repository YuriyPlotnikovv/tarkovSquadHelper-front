new Vue({
  el: '#app',
  data: {
    roomIdInput: '',
    searchQuery: '',
    searchResults: [],
    showSearchResults: false,
    playersList: [],
    nickname: getCookie('nickname') || '',
    roomId: getCookie('roomId') || '',
    showNicknameForm: !getCookie('nickname'),
    isInRoom: !!getCookie('roomId'),
    isSubmitted: false,
    hasError: false,
    currentState: '',
    apiBaseUrl: '',
    searchTimeout: null,
    inviteButtonText: 'Скопировать ссылку на комнату'
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

    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
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
      setCookie('roomId', roomId, 7);
      this.isInRoom = true;
      if (this.nickname) {
        this.showNicknameForm = false;
        this.fetchItems();
      }
    },
    submitNickname() {
      if (this.nickname.trim() !== '') {
        setCookie('nickname', this.nickname, 7);
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
          if (data && data.length > 0) {
            this.groupItemsByNickname(data);
          } else {
            this.playersList = [];
          }
        });
    },
    groupItemsByNickname(items) {
      const groupedItems = items.reduce((accumulator, item) => {
        if (!accumulator[item.nickName]) {
          accumulator[item.nickName] = { nickname: item.nickName, items: [] };
        }
        accumulator[item.nickName].items.push(item);
        return accumulator;
      }, {});
      this.playersList = Object.values(groupedItems);
    },
    handleSearchInput() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.submitSearch();
      }, 300);
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
          item: { key: item.key, nickName: item.nickName },
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
          item: { key: item.key, nickName: item.nickName },
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
          item: { key: item.key, nickName: item.nickName }
        }),
      })
        .then(response => response.json())
        .then(() => {
          const player = this.playersList.find(player => player.nickname === item.nickName);
          player.items = player.items.filter(playerItem => playerItem.key !== item.key);
        });
    },
    handleClickOutside(event) {
      const searchResultsElement = this.$el.querySelector('.page__search-results');
      if (searchResultsElement && !searchResultsElement.contains(event.target)) {
        this.showSearchResults = false;
      }
    },
    copyInviteLink() {
      const inviteLink = `${window.location.origin}${window.location.pathname}?roomId=${this.roomId}`;
      console.log(inviteLink);
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          this.inviteButtonText = 'Ссылка успешно скопирована!';
          setTimeout(() => {
            this.inviteButtonText = 'Скопировать ссылку на комнату';
          }, 2000);
        })
        .catch(err => {
          console.error('Ошибка копирования ссылки:', err);
        });
    }
  }
});
