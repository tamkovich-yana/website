let state = {
  current: 1,
  stadies: 4,
  currentCountry: null,
  data: [
    {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    },
    {
      country: "",
      passportNo: "",
    },
    {
      card: "",
      cardType: "classic",
    },
  ],
};

const showPosition = async ({ coords: { latitude, longitude } }) => {
  try {
    const url = `http://api.geonames.org/countryCodeJSON?lat=${latitude}&lng=${longitude}&username=miss_mallowan`;
    const res = await fetch(url);

    if (res.ok) {
      const { countryName } = await res.json();
      countries.innerHTML = `<option value='${countryName}'>${countryName}</option>`;
    }
  } catch (err) {
    console.log(err);
  }
};

const items = document.querySelectorAll(".item");
const results = document.getElementById("results");
const countries = document.getElementById("countries");
const buttonPrev = document.querySelector(".button-prev");
const buttonNext = document.querySelector(".button-next");
const cardTypeSelect = document.getElementById("cardType");
const formInputs = document.querySelectorAll(".form-input");
const formSelects = document.querySelectorAll(".form-select");
const progressItems = document.querySelectorAll(".progressbar-item");

const sortByAlpha = (arr) => arr.sort((a, b) => a.localeCompare(b));
const getCurrentData = () => state.data[state.current - 1];

const fetchCountries = async () => {
  try {
    const data = await fetch(`https://restcountries.com/v3.1/all?fields=name`);

    if (data.ok) {
      const res = await data.json();
      const newCountries = res.map(({ name: { common } }) => common);

      sortByAlpha(newCountries).map((item) => {
        const option = document.createElement("option");
        option.setAttribute("value", item);
        option.innerText = item;
        countries.insertAdjacentElement("beforeend", option);
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const handleSelectCard = () => {
  const card = getCurrentData()?.card;
  if (!card) return;
  const isVisa = card === "visa";
  cardTypeSelect.classList.toggle("active", isVisa);
  if (!isVisa) {
    const current = state.current - 1;
    state.data[current] = {
      ...state.data[current],
      cardType: "classic",
    };
  }
};

const checkAvailablePrevButton = () => {
  buttonPrev.classList.toggle("disabled", state.current === 1);
};

const checkAvailableNextButton = () => {
  const isFinish = state.current === state.stadies;
  const data = getCurrentData();
  const isAvailable = (data && Object.values(data).every((v) => v)) || isFinish;

  buttonNext.classList.toggle("disabled", !isAvailable);
  buttonNext.innerText = isFinish ? "Finish" : "Next";
};

const handleButtonClick = ({ target }) => {
  if (target.classList.contains("disabled")) return;
  const { button } = target.dataset;
  const current = button === "next" ? state.current + 1 : state.current - 1;

  if (current === state.stadies) setResult();
  if (current > state.stadies || !current) return;

  state = {
    ...state,
    current,
  };

  items.forEach((item) => item.classList.remove("active"));
  const item = document.querySelector(`[data-item="${current}"]`);

  if (!item) return;

  item.classList.add("active");

  checkAvailableNextButton();
  checkAvailablePrevButton();
  changeProgress();
};

const handleInputChange = ({ target: { value, name } }) => {
  const current = state.current - 1;
  state.data[current] = {
    ...state.data[current],
    [name]: value,
  };

  checkAvailableNextButton();
  handleSelectCard();
};

const setResult = () => {
  const data = state.data;
  results.innerHTML = "";
  data.map((item) => {
    return Object.entries(item).map(([key, value]) => {
      const title = key
        .split(/(?=[A-Z])/)
        .join(" ")
        .toUpperCase();

      const div = document.createElement("div");
      div.classList.add("results-item");
      div.innerHTML = `<span>${title}: </span>`;
      div.append(value);
      return results.append(div);
    });
  });
};

const changeProgress = () => {
  progressItems.forEach((item, i) => {
    item.classList.toggle("active", state.current > i);
  });
};

// events
[buttonNext, buttonPrev].forEach((button) => {
  button.addEventListener("click", handleButtonClick);
});
formInputs.forEach((input) => {
  input.addEventListener("input", handleInputChange);
});
formSelects.forEach((input) => {
  input.addEventListener("change", handleInputChange);
});

const getLocation = () => {
  navigator.geolocation.getCurrentPosition(showPosition, fetchCountries);
};

getLocation();
