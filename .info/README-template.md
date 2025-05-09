# {{title-en}}

{{poster-img}}

[🇬🇧 English](#english) | [🇷🇺 Русский](#русский)

---

## English

### {{title-en}}

Project: {{deploy}}

Backend: {{backend}}

{{textFirst-en}}

{{textSecond-en}}

---

### About the project

{{features-en}}

---

### API Methods

- **Create room:** `POST /createCollection`
- **Get items from room:** `GET /getitemsFromCollection?tableName={roomId}`
- **Search items:** `GET /search?q={query}`
- **Increase item count:** `POST /increaseItemCount`
- **Decrease item count:** `POST /decreaseItemCount`
- **Delete item:** `DELETE /deleteItemFromCollection`

---

### Application Methods

- **handleRoomEntry:** Handles entering a room by ID or creates a new room.
- **createRoom:** Creates a new room and automatically enters it.
- **enterRoom:** Enters a room by ID and saves it in cookies.
- **submitNickname:** Saves the user's nickname and updates the item list.
- **fetchItems:** Retrieves the list of items from the room.
- **checkForUpdates:** Checks for updates in the item list.
- **compareAndUpdateItems:** Compares and updates the item list if there are changes.
- **groupItemsByNickname:** Groups items by user nickname.
- **handleSearchInput:** Handles input in the search field with a delay.
- **submitSearch:** Performs a search for items by the entered query.
- **addItemToRoom:** Adds the selected item to the current room.
- **increaseItemCount:** Increases the quantity of the specified item.
- **decreaseItemCount:** Decreases the quantity of the specified item.
- **removeItemFromRoom:** Removes an item from the room.
- **handleClickOutside:** Hides search results when clicking outside the list.
- **copyInviteLink:** Copies the current room link to the clipboard.
- **logout:** Removes user data from cookies and refreshes the page.
- **changeTheme:** Changes the app theme between light and dark.
- **applyTheme:** Applies the selected theme to the interface.
- **toggleList:** Manages opening and closing the participant list.

---

### License

This project is licensed under the [GNU Affero General Public License v3 (AGPLv3)](https://www.gnu.org/licenses/agpl-3.0.html).

---

### Contacts

Author: Yuriy Plotnikov  
Website: https://yuriyplotnikovv.ru

---

## Русский

### {{title-ru}}

Проект: {{deploy}}

Бэкенд: {{backend}}

{{textFirst-ru}}

{{textSecond-ru}}

---

### О проекте

{{features-ru}}

---

### API Методы

- **Создание комнаты:** `POST /createCollection`
- **Получение предметов из комнаты:** `GET /getitemsFromCollection?tableName={roomId}`
- **Поиск предметов:** `GET /search?q={query}`
- **Увеличение количества предметов:** `POST /increaseItemCount`
- **Уменьшение количества предметов:** `POST /decreaseItemCount`
- **Удаление предмета:** `DELETE /deleteItemFromCollection`

---

### Методы в приложении

- **handleRoomEntry:** Обрабатывает вход в комнату, используя введенный ID или создавая новую комнату.
- **createRoom:** Создает новую комнату и автоматически входит в нее.
- **enterRoom:** Входит в комнату по ID и сохраняет его в cookie.
- **submitNickname:** Сохраняет никнейм пользователя и обновляет список предметов.
- **fetchItems:** Получает список предметов из комнаты.
- **checkForUpdates:** Проверяет наличие обновлений в списке предметов.
- **compareAndUpdateItems:** Сравнивает и обновляет список предметов, если есть изменения.
- **groupItemsByNickname:** Группирует предметы по никнейму пользователя.
- **handleSearchInput:** Обрабатывает ввод в поле поиска с задержкой.
- **submitSearch:** Выполняет поиск предметов по введенному запросу.
- **addItemToRoom:** Добавляет выбранный предмет в текущую комнату.
- **increaseItemCount:** Увеличивает количество указанного предмета.
- **decreaseItemCount:** Уменьшает количество указанного предмета.
- **removeItemFromRoom:** Удаляет предмет из комнаты.
- **handleClickOutside:** Скрывает результаты поиска при клике вне списка.
- **copyInviteLink:** Копирует ссылку на текущую комнату в буфер обмена.
- **logout:** Удаляет данные пользователя из cookie и обновляет страницу.
- **changeTheme:** Изменяет тему приложения между светлой и темной.
- **applyTheme:** Применяет выбранную тему к интерфейсу.
- **toggleList:** Управляет открытием и закрытием списка участников.

---

### Лицензия

Проект распространяется под лицензией [GNU Affero General Public License v3 (AGPLv3)](https://www.gnu.org/licenses/agpl-3.0.html).

---

### Контакты

Автор: Yuriy Plotnikov  
Сайт: https://yuriyplotnikovv.ru  
