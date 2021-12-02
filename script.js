// Usunięte zostały deklarowane zmienne które niepotrzebnie blokowały pamięć
// nie potrzebne jest deklarowanie przed użyciem


document.getElementById("searchBtn").addEventListener("click", () => {
  let searchTerm = document.getElementById("searchInput").value;
  if (searchTerm) { 
      weatherApi.getSearchMethod(searchTerm) 
    };

});

// Funkcje zostały przeniesione do klas, obecnie znajdują się w jednym pliku 
// ze względu na blokade CORS. Abyś mógł sprawdzić wszystko bez uruchamiania serweru HTTP


// Klasa weatherApi służy do
// 1. Sprawdzenia metody wyszukiwania
// 2. Ściągniecie obecnej pogody
// 3. Zebranie danych do jednego obiektu w celu zautomatyzowania przypisania ich

class weatherApi {
    // Zastanawiałem się czy stworzyć tutaj konstruktor lecz się waham
    // z jednej strony znalazł bym dla nie zastosowanie ale nie uważam że w naszym
    // przypadku jest on niezbędny
    constructor() {}

    // Jedyna zmiana to bezpośrednie wywołanie metody z klasy weatherApi i wyeliminowanie zmiennej
    // searchMethod, wywołana metoda jest opisana poniżej
    static getSearchMethod (searchTerm) {
        if (searchTerm.lenght === 5 && Number.parseInt(searchTerm) + "" === searchTerm) {
            weatherApi.getCurrentWeather("zip", searchTerm);
        } else {
            weatherApi.getCurrentWeather("q", searchTerm);
        }
    }

    // Metoda która pobiera pogode, przyjmuje 4 argumenty, metode wyszukania, hasło wyszukiwania oraz
    // jednostki i appId, jednostki oraz appId są ustawione defaultowo na metri oraz to id
    // oznacza to że jeśli nie zostaną podane to będą wywołane z tymi wartoścami
    static getCurrentWeather(searchMethod, searchTerm, units = 'metric', appId = '2a5cc3af57a0f47a0d85d5a5a7e2f7de') {
        fetch(`https://api.openweathermap.org/data/2.5/weather?${searchMethod}=${searchTerm}&APPID=${appId}&units=${units}`)
            .then(response => {
                return response.json();
            })
            .then(response => {
                //Tworzymy nowy obiekt który będzie zarządzał naszą treścią, jest on opisany dokładniej poniżej
                // tu należy zaobserwować iż wywołujemy bezpośrednio funkcje z obecnej klasy i przypisujemy już nasz
                //kontener
                new weatherBox(this.gatherWeatherData(response), document.getElementById("weatherContainer"));
            })
            // Dodałem catch aby wyłapywać błędy
            .catch(err => {
                console.log(err)
            })
    }

    static gatherWeatherData(data) {
        // Użyłem destrukturyzacji aby skorzystać tylko z potrzebnych zmiennych znajdujących się
        // w obiekcie data
        const { weather, main, wind, name } = data
        // Stworzyłem obiekt który posłuży nam do iterowania przez obiekty HTML
        // Ich klucze odpowiadają ID w HTMl a wartości tym co mają reprezentować
        const result = {
            weatherIcon : "http://openweathermap.org/img/wn/" + weather[0].icon + ".png",
            weatherDescriptionHeader: weather[0].description.charAt(0).toUpperCase() + weather[0].description.slice(1),
            temperature: Math.floor(main.temp) + "&#176",
            windSpeed: "Winds at " + Math.floor(wind.speed) + " m/s",
            cityHeader: name,
            humidity: "Humidity levels at " + main.humidity + "%",
            state: weather[0].main
        }
        return result
    }
}

//Klasa weatherBox służy do
// 1. Ustawienia tła
// 2. Przypisania danych do elementów HTML
// 3. Ustawienia kontenera na środku

class weatherBox {

    // Aby łatwiej było nam operować naszym kontenerem stworzyłem konstruktor który
    // przyjmuje dane oraz sam ID kontenera.
    // Następnie wywołuje on dwie funkcje które są opisane poniżej
    constructor(data, container) {
        this.data = data;
        this.container = container
        this.setWeatherData()
        this.setWeatherContainerPosition()
    }

    setBackground() {
        // Tworzymy obiekt obrazu
        let bg = new Image();
        // Przypisujemy do zmiennej to jak prawdopodobnie nazywa się obraz
        let bg_url = `./img/${this.data.state.toLowerCase()}.jpg`
        // Przypisujemy tę zmienną do żródła naszego obiektu obrazu 
        bg.src = bg_url
        // Deklarujemy co ma się stać jeśli okaże się iż nasz obraz nie istnieje(zła ścieżka), lub wystąpi inny błąd
        bg.onerror = function () {
            document.body.style.backgroundImage = `url('./img/clear.jpg')`;
        }
        // Deklarujemy co ma się stać jeśli obraz istnieje
        bg.onload = function() {
            document.body.style.backgroundImage = `url(${bg_url})`;
        }
        // Funkcja ta działa ponieważ zmieniłem nazwy obrazów aby odpowiadały tym z openweather
        // dzięki temu pozbywamy się tego długiego switcha
    }

    setWeatherData() {
        // Ustawiamy odpowiednie wartości (temperatura, miasto, prędkość wiatru itp)
        // do odpowiadających im kluczy w kodzie HTML
        for(const [key,value] of Object.entries(this.data)) {
            // try catch do obsługi ew błędów
            try {
                // Jeśli klucz okaże się iż nazywa się weatherIcon to przypiszmy mu nie innerHTML a src
                key != 'weatherIcon' ? document.getElementById(key).innerHTML = value : document.getElementById(key).src = value
            } catch(err) {
                // Specjalny błąd, aby zmniejszyć ilość zmiennych dodałem 'state' do danych. Więc jeśli znajdzie state
                // użyje funkcji do zmiany tła
                // Jesli będzie to inny klucz niż state wyskoczy w konsoli błąd 'Wrong ID'
                key != 'state' ? console.log('Wrong ID') : this.setBackground()
            }
         }
    }
 
    setWeatherContainerPosition() {
        // 1:1 Twoja funkcja setPositionForWeatherInfo() jedynie w konstruktorze przekazuje ID kontenera dzięki
        // czemu tutaj mogę użyć 'this'  
        this.container.style.left = `calc(50% - ${this.container.clientWidth / 2}px)`;
        this.container.style.top = `calc(50% - ${this.container.clientHeight / 2}px)`;
        this.container.style.visibility = "visible";
    }
}