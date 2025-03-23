// カレンダーAPI関連の変数
const apiKey = 'AIzaSyBgC_v4SIrydi0_pqu2aowzOcffJNtKRdk'; // ここに取得したAPIキーを入力
const calendarId = '0c0c36c6be91becc38fd9c74b34a8ddeae8c7af08ab06c4bcb0eaf868a266c03@group.calendar.google.com'; // ここにカレンダーIDを入力
const clientId = '82564215953-1ji0o70j3sbnftdrmpr1poi2t68vnhv0.apps.googleusercontent.com'; // ここに取得したクライアントIDを入力
const scopes = 'https://www.googleapis.com/auth/calendar.events';

document.addEventListener('DOMContentLoaded', function() {

    // LocalStorageからの認証情報の復元
    let users = localStorage.getItem('users');

    if (!users) {
        // users.json ファイルを読み込む (初回のみ)
        fetch('/users.json')
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('users', JSON.stringify(data)); // LocalStorageに保存
            });
    }

    // ログアウトボタン（ホームページ）
    const logoutButton = document.getElementById('logout-button');

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            // ログアウト処理
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('loggedInUser');
            window.location.href = '/logout.html';
        });
    }

    // ログアウトページ (`logout.html`) の処理
    const confirmLogoutButton = document.getElementById('confirm-logout');

    if (confirmLogoutButton) {
        confirmLogoutButton.addEventListener('click', function() {
            // ログアウト処理 (Cookie削除、セッション破棄など) を記述
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('loggedInUser');
            alert('ログアウトしました。'); // 確認用アラート
            window.location.href = '/signin.html'; //ログインページにリダイレクト
        });
    }


    // サインアップフォーム
    const signupForm = document.getElementById('signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault(); // デフォルトのフォーム送信をキャンセル

            // 入力値を取得
            const hrno = document.getElementById('hrno').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const passwordConfirm = document.getElementById('password-confirm').value;

            // パスワードの確認
            if (password !== passwordConfirm) {
                alert('パスワードとパスワード (確認) が一致しません。');
                return;
            }

            // ユーザー登録処理 (ファイルベース)
            registerUser(hrno, username, password)
                .then(success => {
                    if (success) {
                        // サインアップ成功
                        alert('サインアップが完了しました。サインインしてください。');
                        window.location.href = '/signin.html'; // サインインページにリダイレクト
                    } else {
                        // サインアップ失敗
                        alert('サインアップに失敗しました。HRNOが既に登録されています。');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('サインアップ中にエラーが発生しました。');
                });
        });
    }


    // サインインフォーム
    const signinForm = document.getElementById('signin-form');

    if (signinForm) {
        signinForm.addEventListener('submit', function(event) {
            event.preventDefault(); // デフォルトのフォーム送信をキャンセル

            // 入力値を取得
            const hrno = document.getElementById('hrno').value;
            const password = document.getElementById('password').value;

            // ユーザー認証処理 (ファイルベース)
            authenticateUser(hrno, password)
                .then(user => {
                    if (user) {
                        // サインイン成功
                        alert('サインインしました。');
                        localStorage.setItem('isAuthenticated', 'true'); //認証状態を保存
                        localStorage.setItem('loggedInUser', JSON.stringify(user));
                        displayUsername(user.username);
                        window.location.href = '/home.html'; // ホームページにリダイレクト
                    } else {
                        // サインイン失敗
                        alert('サインインに失敗しました。HRNOまたはパスワードが間違っています。');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('サインイン中にエラーが発生しました。');
                });
        });
    }

    // ヘッダーのリンク動作
    const homeButton = document.querySelector('header nav ul li a[href="/home.html"]');
    const calendarButton = document.querySelector('header nav ul li a[href="/calendar.html"]');

    if (homeButton) {
        homeButton.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = '/home.html';
        });
    }

    if (calendarButton) {
        calendarButton.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = '/calendar.html';
        });
    }

    // カレンダーに予定をセット
    const calendarArea = document.getElementById('calendar-section'); // calendarArea を設定

    if (calendarArea) {
        // ここにGoogle Calendar APIから予定を取得して表示する関数を呼び出す
        fetchCalendarEvents(calendarArea);
    }

    // ページの読み込み時にユーザー名を表示
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        displayUsername(user.username);
    }

    // ホーム画面の予定を取得
    if (window.location.pathname === '/') {
        displayTodayEvents();
        displayNextEvent(); // 関数名を修正
    }

        // 欠席・遅刻・早退連絡フォームの送信処理
       const attendanceForm = document.getElementById('attendanceForm');

       if (attendanceForm) {
           attendanceForm.addEventListener('submit', function(event) {
               event.preventDefault(); // デフォルトのフォーム送信をキャンセル

               // 入力値を取得
               const attendanceType = document.getElementById('attendanceType').value;
               const attendanceDate = document.getElementById('attendanceDate').value;
               const reason = document.getElementById('reason').value;

               // Google Calendar APIにイベントを追記
               addAttendanceToCalendar(attendanceType, attendanceDate, reason)
                   .then(success => {
                       if (success) {
                           // 送信成功
                           alert('送信が完了しました。');
                           attendanceForm.reset(); // フォームをリセット
                       } else {
                           // 送信失敗
                           alert('送信に失敗しました。');
                       }
                   })
                   .catch(error => {
                       console.error('Error:', error);
                       alert('送信中にエラーが発生しました。');
                   });
           });
       }

});

// ページアクセス制限
if (window.location.pathname === '/home.html') {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = '/signin.html';
    }
}


// ユーザー認証処理 (ファイルベース)
async function authenticateUser(hrno, password) {
    try {
        const usersData = localStorage.getItem('users');
        const users = JSON.parse(usersData);

        const user = users.find(user => user.hrno === hrno && user.password === password);
        return user; // ユーザーオブジェクトを返す
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// ユーザー登録処理 (ファイルベース)
async function registerUser(hrno, username, password) {
    try {
        const usersData = localStorage.getItem('users');
        let users = JSON.parse(usersData);

        if (!users) {
            users = []; // LocalStorageにユーザー情報がない場合は初期化
        }

        // HRNOが既に登録されていないか確認
        const existingUser = users.find(user => user.hrno === hrno);
        if (existingUser) {
            return false; // 登録失敗: HRNOが既に登録されている
        }

        // 新しいユーザーを追加
        const newUser = {
            hrno: hrno,
            username: username,
            password: password
        };
        users.push(newUser);

        // LocalStorageを更新
        localStorage.setItem('users', JSON.stringify(users));
        return true; // 登録成功

    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

// ユーザー名を表示する関数
function displayUsername(username) {
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = `(${username}さん)`;
        usernameDisplay.style.display = 'inline'; // 表示
    }
}


// カレンダー表示処理
function fetchCalendarEvents(area) {
    const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${new Date().toISOString()}&singleEvents=true&orderBy=startTime`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                // イベントリストを area に表示
                let eventListHTML = `<h2><i class="far fa-calendar-alt"></i> 予定表</h2> <div id="event-list">`;
                data.items.forEach(event => {
                    // イベントの開始時間と終了時間を取得
                    const startTime = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date + 'T00:00:00'); // dateの場合0時0分にする
                    const endTime = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date + 'T23:59:59'); // dateの場合23時59分にする

                    // 開始時間と終了時間をフォーマット
                    const startTimeFormatted = startTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    const endTimeFormatted = endTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    const startDateFormatted = startTime.toLocaleDateString();

                    eventListHTML += `
                        <section class="event">
                            <h3>${event.summary}</h3>
                            <p class="event-info"><i class="far fa-calendar-alt"></i> ${startDateFormatted}</p>
                            <p class="event-info"><i class="far fa-clock"></i> ${startTimeFormatted} - ${endTimeFormatted}</p>
                            <p class="event-info"><i class="fas fa-map-marker-alt"></i> ${event.location || '場所未定'}</p>
                        </section>
                    `;
                });
                eventListHTML += `</div>`;
                area.innerHTML = eventListHTML;
            } else {
                area.innerHTML = '<p>予定がありません。</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            area.innerHTML = '<p>予定の取得に失敗しました。</p>';
        });
}

// ホーム画面の「今日の予定」を表示する関数
function displayTodayEvents() {
    const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${new Date().toISOString()}&timeMax=${new Date(new Date().setHours(23, 59, 59, 999)).toISOString()}&singleEvents=true&orderBy=startTime`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const todayEventList = document.getElementById('today-event-list');
            if (data.items && data.items.length > 0) {
                let eventListHTML = '';
                data.items.forEach(event => {
                    const startTime = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date + 'T00:00:00');
                    const startTimeFormatted = startTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    eventListHTML += `
                        <section class="event">
                            <h3>${event.summary}</h3>
                            <p class="event-info"><i class="far fa-clock"></i> ${startTimeFormatted}</p>
                            <p class="event-info"><i class="fas fa-map-marker-alt"></i> ${event.location || '場所未定'}</p>
                        </section>
                    `;
                });
                todayEventList.innerHTML = eventListHTML;
            } else {
                todayEventList.innerHTML = '<p>今日の予定はありません。</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('today-event-list').innerHTML = '<p>予定の取得に失敗しました。</p>';
        });
}

// ホーム画面の「次回の予定」を表示する関数
function displayNextEvent() {
    const nextEventContainer = document.getElementById('next-practice-event');
    if (nextEventContainer) {
        const now = new Date();
        const nowISO = now.toISOString();
        const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${nowISO}&maxResults=50&singleEvents=true&orderBy=startTime`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.items && data.items.length > 0) {
                    // 今日以降のイベントを取得
                    const upcomingEvents = data.items.filter(event => {
                        const eventStart = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date + 'T00:00:00');
                        return eventStart >= now;
                    });

                    if (upcomingEvents.length > 0) {
                        // 最も近いイベントを取得
                        const nextEvent = upcomingEvents[0]; // 既にソートされているため、先頭が最も近いイベント
                        const startTime = nextEvent.start.dateTime ? new Date(nextEvent.start.dateTime) : new Date(nextEvent.start.date + 'T00:00:00');
                        const endTime = nextEvent.end.dateTime ? new Date(nextEvent.end.dateTime) : new Date(nextEvent.end.date + 'T23:59:59');
                        const startTimeFormatted = startTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        const endTimeFormatted = endTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        const startDateFormatted = startTime.toLocaleDateString();

                        nextEventContainer.innerHTML = `
                            <div class="event">
                                <h3>${nextEvent.summary}</h3>
                                <p class="event-info"><i class="far fa-calendar-alt"></i> ${startDateFormatted}</p>
                                <p class="event-info"><i class="far fa-clock"></i> ${startTimeFormatted} - ${endTimeFormatted}</p>
                                <p class="event-info"><i class="fas fa-map-marker-alt"></i> ${nextEvent.location || '場所未定'}</p>
                            </div>
                        `;
                    } else {
                        nextEventContainer.innerHTML = '<p>次回の予定はありません。</p>';
                    }
                } else {
                    nextEventContainer.innerHTML = '<p>次回の予定はありません。</p>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                nextEventContainer.innerHTML = '<p>予定の取得に失敗しました。</p>';
            });
    }
}


// 欠席・遅刻・早退連絡をGoogleカレンダーに追記する関数
async function addAttendanceToCalendar(attendanceType, attendanceDate, reason) {
    try {
        const accessToken = localStorage.getItem('googleAccessToken'); // OAuth認証済みのアクセストークンを使用

        if (!accessToken) {
            alert("Googleアカウントにログインしてください。");
            authenticateGoogle(); // Google認証を促す
            return false;
        }

        const event = {
            summary: `【${attendanceType}連絡】`,
            description: `種類: ${attendanceType}\n理由: ${reason}`,
            start: {
                date: attendanceDate,
            },
            end: {
                date: attendanceDate,
            }
        };

        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(event)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            alert(`予定の追加に失敗しました。エラー: ${errorData.error.message}`);
            return false;
        }

        alert("予定が追加されました！");
        return true;

    } catch (error) {
        console.error("Error:", error);
        alert(`予定の追加中にエラーが発生しました。エラー: ${error.message}`);
        return false;
    }
}

function authenticateGoogle() {
    gapi.load("client:auth2", function() {
        gapi.auth2.init({
            client_id: clientId,
            scope: scopes
        }).then(function() {
            const authInstance = gapi.auth2.getAuthInstance();
            authInstance.signIn().then(function(user) {
                const accessToken = user.getAuthResponse().access_token;
                localStorage.setItem('googleAccessToken', accessToken);
                alert("Googleアカウント認証が完了しました。");
            });
        });
    });
}