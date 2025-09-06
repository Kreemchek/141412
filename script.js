// Константы
const ACQUIRING_RATE = 0.025; // 2.5%
const TAX_RATES = {
    low: 0.02,   // 2%
    medium: 0.05, // 5%
    high: 0.07   // 7%
};

// Telegram Web App инициализация
let tg = null;
let isTelegramWebApp = false;

// Проверяем, запущено ли приложение в Telegram
if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    isTelegramWebApp = true;
    console.log('Telegram Web App detected');
}

// Функция для форматирования чисел
function formatNumber(num, decimals = 2) {
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

// Функция для форматирования процентов
function formatPercent(num, decimals = 2) {
    return formatNumber(num * 100, decimals) + '%';
}

// Функция для получения значения из поля ввода
function getInputValue(id) {
    const element = document.getElementById(id);
    const value = parseFloat(element.value) || 0;
    return value;
}

// Функция для валидации данных
function validateInputs() {
    const requiredFields = [
        'units-sold',
        'purchase-price',
        'selling-price'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        const value = getInputValue(fieldId);
        
        if (value <= 0) {
            element.classList.add('error');
            isValid = false;
        } else {
            element.classList.remove('error');
        }
    });
    
    return isValid;
}

// Основная функция расчета
function calculateEconomics() {
    // Валидация данных
    if (!validateInputs()) {
        alert('Пожалуйста, заполните все обязательные поля корректными значениями.');
        return;
    }
    
    // Получение данных из формы
    const data = {
        unitsSold: getInputValue('units-sold'),
        logistics: getInputValue('logistics'),
        fulfillment: getInputValue('fulfillment'),
        wbCommission: getInputValue('wb-commission') / 100, // Конвертируем в десятичную дробь
        storageCost: getInputValue('storage-cost'),
        advertising: getInputValue('advertising'),
        purchasePrice: getInputValue('purchase-price'),
        sellingPrice: getInputValue('selling-price'),
        redemptionRate: getInputValue('redemption-rate') / 100 // Конвертируем в десятичную дробь
    };
    
    // Расчеты для одной единицы товара
    const unitCalculations = calculateUnitEconomics(data);
    
    // Расчеты для общего количества
    const totalCalculations = calculateTotalEconomics(data, unitCalculations);
    
    // Отображение результатов
    displayResults(unitCalculations, totalCalculations, data);
    
    // Добавляем класс для анимации
    document.querySelector('.results-section').classList.add('calculated');
}

// Расчет юнит-экономики для одной единицы
function calculateUnitEconomics(data) {
    const {
        logistics,
        fulfillment,
        wbCommission,
        storageCost,
        advertising,
        purchasePrice,
        sellingPrice,
        redemptionRate
    } = data;
    
    // Выручка с учетом процента выкупа
    const revenue = sellingPrice * redemptionRate;
    
    // Комиссия ВБ
    const wbCommissionAmount = revenue * wbCommission;
    
    // Эквайринг
    const acquiringAmount = revenue * ACQUIRING_RATE;
    
    // Общие расходы на единицу товара
    const totalCosts = purchasePrice + logistics + fulfillment + storageCost + advertising;
    
    // Налоги
    const taxes = {
        low: revenue * TAX_RATES.low,
        medium: revenue * TAX_RATES.medium,
        high: revenue * TAX_RATES.high
    };
    
    // Прибыль до налогов
    const profitBeforeTax = revenue - wbCommissionAmount - acquiringAmount - totalCosts;
    
    // Прибыль после налогов
    const profits = {
        low: profitBeforeTax - taxes.low,
        medium: profitBeforeTax - taxes.medium,
        high: profitBeforeTax - taxes.high
    };
    
    // Маржинальность (прибыль / выручка * 100)
    const margin = revenue > 0 ? (profitBeforeTax / revenue) * 100 : 0;
    
    // Рентабельность (прибыль / себестоимость * 100)
    const profitability = totalCosts > 0 ? (profitBeforeTax / totalCosts) * 100 : 0;
    
    return {
        revenue,
        wbCommissionAmount,
        acquiringAmount,
        totalCosts,
        taxes,
        profitBeforeTax,
        profits,
        margin,
        profitability
    };
}

// Расчет общей экономики
function calculateTotalEconomics(data, unitCalculations) {
    const { unitsSold } = data;
    
    return {
        totalRevenue: unitCalculations.revenue * unitsSold,
        totalWbCommission: unitCalculations.wbCommissionAmount * unitsSold,
        totalAcquiring: unitCalculations.acquiringAmount * unitsSold,
        totalCosts: unitCalculations.totalCosts * unitsSold,
        totalTaxes: {
            low: unitCalculations.taxes.low * unitsSold,
            medium: unitCalculations.taxes.medium * unitsSold,
            high: unitCalculations.taxes.high * unitsSold
        },
        totalProfitBeforeTax: unitCalculations.profitBeforeTax * unitsSold,
        totalProfits: {
            low: unitCalculations.profits.low * unitsSold,
            medium: unitCalculations.profits.medium * unitsSold,
            high: unitCalculations.profits.high * unitsSold
        }
    };
}

// Функции для работы с Telegram
function initTelegramWebApp() {
    if (isTelegramWebApp && tg) {
        // Настраиваем приложение
        tg.ready();
        tg.expand();
        
        // Применяем тему Telegram
        document.body.classList.add('telegram-webapp');
        
        // Настраиваем главную кнопку
        tg.MainButton.setText('Поделиться результатами');
        tg.MainButton.show();
        tg.MainButton.onClick(shareResults);
        
        // Настраиваем кнопку "Назад"
        tg.BackButton.show();
        tg.BackButton.onClick(() => {
            tg.close();
        });
        
        console.log('Telegram Web App initialized');
        console.log('User:', tg.initDataUnsafe.user);
    }
}

function shareResults() {
    if (!isTelegramWebApp || !tg) return;
    
    const results = getCurrentResults();
    const message = formatResultsForSharing(results);
    
    // Отправляем данные в Telegram
    tg.sendData(JSON.stringify({
        type: 'unit_economics_results',
        data: results,
        message: message
    }));
    
    // Показываем уведомление
    tg.showAlert('Результаты отправлены!');
}

function getCurrentResults() {
    return {
        timestamp: new Date().toLocaleString('ru-RU'),
        inputs: {
            unitsSold: getInputValue('units-sold'),
            logistics: getInputValue('logistics'),
            fulfillment: getInputValue('fulfillment'),
            wbCommission: getInputValue('wb-commission'),
            storageCost: getInputValue('storage-cost'),
            advertising: getInputValue('advertising'),
            purchasePrice: getInputValue('purchase-price'),
            sellingPrice: getInputValue('selling-price'),
            redemptionRate: getInputValue('redemption-rate')
        },
        results: {
            margin: document.getElementById('margin').textContent,
            profitability: document.getElementById('profitability').textContent,
            profit5: document.getElementById('profit-5').textContent,
            profit7: document.getElementById('profit-7').textContent,
            profit2: document.getElementById('profit-2').textContent
        }
    };
}

function formatResultsForSharing(results) {
    const { inputs, results: calcResults } = results;
    
    return `📊 *Результаты расчета юнит-экономики*

💰 *Основные параметры:*
• Продано единиц: ${inputs.unitsSold}
• Цена продажи: ${inputs.sellingPrice} руб.
• Закупочная цена: ${inputs.purchasePrice} руб.
• Комиссия ВБ: ${inputs.wbCommission}%

📈 *Результаты:*
• Маржинальность: ${calcResults.margin}
• Рентабельность: ${calcResults.profitability}
• Прибыль (5%): ${calcResults.profit5}
• Прибыль (7%): ${calcResults.profit7}
• Прибыль (2%): ${calcResults.profit2}

🤖 *Калькулятор:* @MaksimovWB`;
}

// Отображение результатов
function displayResults(unitCalculations, totalCalculations, data) {
    // Налоги
    document.getElementById('tax-5').textContent = formatNumber(unitCalculations.taxes.medium) + ' руб.';
    document.getElementById('tax-7').textContent = formatNumber(unitCalculations.taxes.high) + ' руб.';
    document.getElementById('tax-2').textContent = formatNumber(unitCalculations.taxes.low) + ' руб.';
    
    // Прибыль
    document.getElementById('profit-5').textContent = formatNumber(unitCalculations.profits.medium) + ' руб.';
    document.getElementById('profit-7').textContent = formatNumber(unitCalculations.profits.high) + ' руб.';
    document.getElementById('profit-2').textContent = formatNumber(unitCalculations.profits.low) + ' руб.';
    
    // Ключевые метрики
    document.getElementById('margin').textContent = formatPercent(unitCalculations.margin / 100);
    document.getElementById('profitability').textContent = formatPercent(unitCalculations.profitability / 100);
    
    // Сводка по единице товара
    const summaryElement = document.getElementById('unit-summary');
    summaryElement.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div>
                <strong>Выручка с единицы:</strong><br>
                ${formatNumber(unitCalculations.revenue)} руб.
            </div>
            <div>
                <strong>Себестоимость единицы:</strong><br>
                ${formatNumber(unitCalculations.totalCosts)} руб.
            </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div>
                <strong>Комиссия ВБ:</strong><br>
                ${formatNumber(unitCalculations.wbCommissionAmount)} руб.
            </div>
            <div>
                <strong>Эквайринг:</strong><br>
                ${formatNumber(unitCalculations.acquiringAmount)} руб.
            </div>
        </div>
        <div style="background: rgba(255,255,255,0.7); padding: 15px; border-radius: 10px; margin-top: 15px;">
            <strong>Общая сводка (${data.unitsSold} единиц):</strong><br>
            • Общая выручка: ${formatNumber(totalCalculations.totalRevenue)} руб.<br>
            • Общие расходы: ${formatNumber(totalCalculations.totalCosts)} руб.<br>
            • Прибыль до налогов: ${formatNumber(totalCalculations.totalProfitBeforeTax)} руб.<br>
            • Лучшая прибыль (2%): ${formatNumber(totalCalculations.totalProfits.low)} руб.
        </div>
    `;
}

// Функция для очистки формы
function clearForm() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('error');
    });
    
    // Очищаем результаты
    const resultElements = document.querySelectorAll('.value');
    resultElements.forEach(element => {
        if (element.id) {
            element.textContent = '0.00 руб.';
        }
    });
    
    document.getElementById('margin').textContent = '0.00%';
    document.getElementById('profitability').textContent = '0.00%';
    document.getElementById('unit-summary').innerHTML = '<p>Заполните данные для расчета</p>';
    
    document.querySelector('.results-section').classList.remove('calculated');
}

// Функция для экспорта результатов
function exportResults() {
    const results = {
        timestamp: new Date().toLocaleString('ru-RU'),
        inputs: {
            unitsSold: getInputValue('units-sold'),
            logistics: getInputValue('logistics'),
            fulfillment: getInputValue('fulfillment'),
            wbCommission: getInputValue('wb-commission'),
            storageCost: getInputValue('storage-cost'),
            advertising: getInputValue('advertising'),
            purchasePrice: getInputValue('purchase-price'),
            sellingPrice: getInputValue('selling-price'),
            redemptionRate: getInputValue('redemption-rate')
        },
        results: {
            margin: document.getElementById('margin').textContent,
            profitability: document.getElementById('profitability').textContent,
            profit5: document.getElementById('profit-5').textContent,
            profit7: document.getElementById('profit-7').textContent,
            profit2: document.getElementById('profit-2').textContent
        }
    };
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `unit-economics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем Telegram Web App
    initTelegramWebApp();
    
    // Автоматический расчет при изменении полей
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // Убираем класс ошибки при вводе
            this.classList.remove('error');
        });
    });
    
    // Обработка Enter в полях ввода
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateEconomics();
            }
        });
    });
    
    // Добавляем кнопки управления
    const inputSection = document.querySelector('.input-section');
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px; margin-top: 20px;';
    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Очистить';
    clearBtn.className = 'calculate-btn';
    clearBtn.style.cssText = 'background: #6c757d; flex: 1;';
    clearBtn.onclick = clearForm;
    
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Экспорт';
    exportBtn.className = 'calculate-btn';
    exportBtn.style.cssText = 'background: #28a745; flex: 1;';
    exportBtn.onclick = exportResults;
    
    buttonContainer.appendChild(clearBtn);
    buttonContainer.appendChild(exportBtn);
    inputSection.appendChild(buttonContainer);
});

// Функция для демонстрации с примерными данными
function loadExampleData() {
    document.getElementById('units-sold').value = '100';
    document.getElementById('logistics').value = '25.50';
    document.getElementById('fulfillment').value = '15.00';
    document.getElementById('wb-commission').value = '15.5';
    document.getElementById('storage-cost').value = '5.00';
    document.getElementById('advertising').value = '50.00';
    document.getElementById('purchase-price').value = '200.00';
    document.getElementById('selling-price').value = '450.00';
    document.getElementById('redemption-rate').value = '85';
    
    calculateEconomics();
}

// Добавляем кнопку для загрузки примера
document.addEventListener('DOMContentLoaded', function() {
    // Находим существующий контейнер кнопок
    const buttonsContainer = document.querySelector('.header-buttons');
    
    // Создаем кнопку "Загрузить пример"
    const exampleBtn = document.createElement('button');
    exampleBtn.textContent = 'Загрузить пример';
    exampleBtn.style.cssText = `
        background: #3b82f6;
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        margin-top: 0;
        margin-left: 0;
        transition: all 0.2s ease;
        font-size: 0.875rem;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        flex: 1;
        justify-content: center;
    `;
    exampleBtn.onclick = loadExampleData;
    exampleBtn.onmouseover = function() {
        this.style.background = '#2563eb';
    };
    exampleBtn.onmouseout = function() {
        this.style.background = '#3b82f6';
    };
    
    // Добавляем кнопку в существующий контейнер
    buttonsContainer.appendChild(exampleBtn);
});
