document.addEventListener("DOMContentLoaded", function () {

    const form = document.querySelector("form");
    const btn = form.querySelector("button");
    const phoneInput = form.phone;

    // -------------------
    // МАСКА ТЕЛЕФОНА
    // -------------------
    const mask = IMask(phoneInput, {
        mask: '+{7} (000) 000-00-00'
    });

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        // -------------------
        // ПРОВЕРКА НОМЕРА
        // -------------------
        const raw = mask.unmaskedValue; // только цифры

        if (raw.length !== 11 || !raw.startsWith("7")) {
            alert("Введите корректный номер телефона");
            return;
        }

        // -------------------
        // ЗАЩИТА ОТ ДВОЙНОГО КЛИКА
        // -------------------
        btn.disabled = true;
        btn.textContent = "Отправка...";

        const formData = {
            name: form.name.value.trim(),
            phone: phoneInput.value
        };

        const webhookURL = "https://script.google.com/macros/s/AKfycbwbf0v-IIfJmTvkhffWUNzPYg6TG3SQ5u7SbTN--4XA2enfsA8dTGOTGcvwOvN_HBnj/exec";

        try {
            await fetch(webhookURL, {
                method: "POST",
                mode: "no-cors", // избегаем CORS
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            alert("Заявка отправлена!");
            form.reset();
            mask.updateValue();

        } catch (err) {
            alert("Ошибка отправки!");
        }

        // возвращаем кнопку
        btn.disabled = false;
        btn.textContent = "Отправить";
    });

});
