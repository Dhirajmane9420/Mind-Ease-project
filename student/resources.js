// A single place to store all resource data and translations
const resourcesData = [
    // --- LOW-LEVEL STRESS ---
    {
        stressLevel: 'low',
        link: 'https://youtu.be/x_DMyF3GjCk?si=Y21rZE476J4Xe95S',
        title: {
            english: 'How to make stress your friend',
            hindi: 'तनाव को अपना दोस्त कैसे बनाएं',
            marathi: 'तणावाला आपला मित्र कसे बनवायचे'
        },
        description: {
            english: 'A short, animated talk explaining the concept of eustress.',
            hindi: 'यूस्ट्रेस की अवधारणा को समझाते हुए एक छोटी, एनिमेटेड बातचीत।',
            marathi: 'युस्ट्रेसची संकल्पना स्पष्ट करणारी एक छोटी, ॲनिमेटेड चर्चा.'
        }
    },
    {
        stressLevel: 'low',
        link: 'https://youtu.be/tAUf7aajBWE?si=5SafQWKI83z5qsQe',
        title: {
            english: 'Yoga at Your Desk',
            hindi: 'आपकी मेज पर योग',
            marathi: 'तुमच्या डेस्कवर योग'
        },
        description: {
            english: 'A 5-minute desk yoga routine for a quick stretching break.',
            hindi: 'त्वरित स्ट्रेचिंग ब्रेक के लिए 5 मिनट का डेस्क योग रूटीन।',
            marathi: 'झटपट स्ट्रेचिंग ब्रेकसाठी 5-मिनिटांचा डेस्क योग दिनक्रम.'
        }
    },
    {
        stressLevel: 'low',
        link: 'https://youtu.be/W6YI3ZFOL0A?si=bNHxmmh8PvXRBx3O',
        title: {
            english: '1 hour of aesthetic & calm lofi music',
            hindi: '1 घंटे का सुंदर और शांत लोफ़ी संगीत',
            marathi: '1 तासाचे सुंदर आणि शांत लोफी संगीत'
        },
        description: {
            english: 'Non-lyrical music designed to help you concentrate and relax.',
            hindi: 'आपको ध्यान केंद्रित करने और आराम करने में मदद करने के लिए डिज़ाइन किया गया गैर-गीतात्मक संगीत।',
            marathi: 'तुम्हाला एकाग्र होण्यासाठी आणि आराम करण्यासाठी डिझाइन केलेले गीत नसलेले संगीत.'
        }
    },
    // --- MODERATE-LEVEL STRESS ---
    {
        stressLevel: 'moderate',
        link: 'https://youtu.be/enJyOTvEn4M?si=-Sgx5vvhMmvB0rn_',
        title: {
            english: '5 Minute Breathing Exercise (Guided Meditation)',
            hindi: '5 मिनट का श्वास व्यायाम (निर्देशित ध्यान)',
            marathi: '5 मिनिटांचा श्वासोच्छवासाचा व्यायाम (मार्गदर्शित ध्यान)'
        },
        description: {
            english: 'A crucial visual guide for a specific breathing and grounding technique.',
            hindi: 'एक विशिष्ट श्वास और ग्राउंडिंग तकनीक के लिए एक महत्वपूर्ण दृश्य मार्गदर्शिका।',
            marathi: 'एका विशिष्ट श्वास आणि ग्राउंडिंग तंत्रासाठी एक महत्त्वपूर्ण दृश्य मार्गदर्शक.'
        }
    },
    {
        stressLevel: 'moderate',
        link: 'https://youtu.be/IumIKwyx8pg?si=F8FFL5D22JTLObMO',
        title: {
            english: '4-7-8 Calm Breathing Exercise',
            hindi: '4-7-8 शांत श्वास व्यायाम',
            marathi: '4-7-8 शांत श्वास व्यायाम'
        },
        description: {
            english: 'A 5-minute guided breathwork session to help you relax quickly or fall asleep.',
            hindi: 'आपको जल्दी आराम करने या सोने में मदद करने के लिए 5 मिनट का निर्देशित श्वास-कार्य सत्र।',
            marathi: 'तुम्हाला लवकर आराम करण्यास किंवा झोप लागण्यास मदत करण्यासाठी 5-मिनिटांचे मार्गदर्शित श्वास-कार्य सत्र.'
        }
    },
    {
        stressLevel: 'moderate',
        link: 'https://youtu.be/kapvpqwcNLQ?si=MHGPqXrOAv0TJJ8f',
        title: {
            english: '10 Minute Mindful Walking Meditation',
            hindi: '10 मिनट का सचेत चलने का ध्यान',
            marathi: '10 मिनिटांचे सजग चालण्याचे ध्यान'
        },
        description: {
            english: 'Learn how to practice mindfulness in an everyday situation like walking.',
            hindi: 'चलने जैसी रोजमर्रा की स्थिति में सचेतनता का अभ्यास करना सीखें।',
            marathi: 'चालण्यासारख्या दैनंदिन परिस्थितीत सजगतेचा सराव कसा करायचा ते शिका.'
        }
    },
    {
        stressLevel: 'moderate',
        link: 'https://youtu.be/IZub-H2G4d4?si=irYdhWuQ9txze2eb',
        title: {
            english: 'Progressive Muscle Relaxation To Ease Anxiety',
            hindi: 'चिंता कम करने के लिए प्रगतिशील मांसपेशी छूट',
            marathi: 'चिंता कमी करण्यासाठी प्रगतीशील स्नायू शिथिलता'
        },
        description: {
            english: 'A guided session to reduce physical tension by tensing and relaxing muscles.',
            hindi: 'मांसपेशियों को कसकर और ढीला करके शारीरिक तनाव कम करने के लिए एक निर्देशित सत्र।',
            marathi: 'स्नायूंना ताणून आणि आराम देऊन शारीरिक तणाव कमी करण्यासाठी एक मार्गदर्शित सत्र.'
        }
    },
    // --- HIGH-LEVEL STRESS ---
     {
        stressLevel: 'high',
        link: 'https://youtu.be/FWTNMzK9vG4?si=SauoBolW3H-qZrqi',
        title: { english: 'Why you procrastinate even when it feels bad', hindi: 'बुरा लगने पर भी आप विलंब क्यों करते हैं', marathi: 'वाईट वाटत असतानाही तुम्ही दिरंगाई का करता' },
        description: { english: 'A deep dive into the psychology of procrastination and how to address it.', hindi: 'विलंब के मनोविज्ञान और इससे निपटने के तरीके में एक गहरा गोता।', marathi: ' दिरंगाईच्या मानसशास्त्रात आणि त्यावर मात कशी करावी यात खोलवर डुबकी मारा.' }
    },
    {
        stressLevel: 'high',
        link: 'https://youtu.be/nFkHV7LfVUc?si=P5BeJxL8HfoI1SwE',
        title: { english: 'Release Stress and Anxious Thoughts', hindi: 'तनाव और चिंतित विचारों को छोड़ें', marathi: 'तणाव आणि चिंताग्रस्त विचार सोडा' },
        description: { english: 'A short, workshop-style meditation to help release difficult thoughts.', hindi: 'कठिन विचारों को छोड़ने में मदद करने के लिए एक छोटा, कार्यशाला-शैली का ध्यान।', marathi: 'कठीण विचार सोडण्यात मदत करण्यासाठी एक छोटे, कार्यशाळा-शैलीतील ध्यान.' }
    },
    {
        stressLevel: 'high',
        link: 'https://youtu.be/t0kACis_dJE?si=yS0mEMq5ZVetZFkF',
        title: { english: '6 tips for better sleep', hindi: 'बेहतर नींद के लिए 6 टिप्स', marathi: 'चांगल्या झोपेसाठी ६ टिप्स' },
        description: { english: 'A practical, science-based guide to improving your sleep hygiene.', hindi: 'आपकी नींद की स्वच्छता में सुधार के लिए एक व्यावहारिक, विज्ञान-आधारित मार्गदर्शिका।', marathi: 'तुमची झोपेची स्वच्छता सुधारण्यासाठी एक व्यावहारिक, विज्ञान-आधारित मार्गदर्शक.' }
    }
];

const uiText = {
    english: { low: 'For Low-Level Stress', moderate: 'For Moderate-Level Stress', high: 'For High-Level Stress', watch: 'Watch Video' },
    hindi: { low: 'कम तनाव के लिए', moderate: 'मध्यम तनाव के लिए', high: 'उच्च तनाव के लिए', watch: 'वीडियो देखें' },
    marathi: { low: 'कमी-पातळीच्या तणावासाठी', moderate: 'मध्यम-पातळीच्या तणावासाठी', high: 'उच्च-पातळीच्या तणावासाठी', watch: 'व्हिडिओ पहा' }
};

function createResourceCard(resource, language) {
    return `
        <div class="bg-white/70 p-5 rounded-lg shadow-sm flex flex-col">
            <h3 class="font-semibold text-lg text-slate-800">${resource.title[language]}</h3>
            <p class="text-sm text-slate-500 mt-1 mb-4 flex-grow">${resource.description[language]}</p>
            <a href="${resource.link}" target="_blank" class="text-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
                <i class="fas fa-play mr-2"></i>${uiText[language].watch}
            </a>
        </div>
    `;
}

function renderResources() {
    const language = document.getElementById('languageSelector').value;
    
    // Update section titles
    document.getElementById('low-stress-title').textContent = uiText[language].low;
    document.getElementById('moderate-stress-title').textContent = uiText[language].moderate;
    document.getElementById('high-stress-title').textContent = uiText[language].high;

    // Get containers
    const lowContainer = document.getElementById('low-stress-container');
    const moderateContainer = document.getElementById('moderate-stress-container');
    const highContainer = document.getElementById('high-stress-container');
    
    // Clear all containers
    lowContainer.innerHTML = '';
    moderateContainer.innerHTML = '';
    highContainer.innerHTML = '';
    
    // Populate containers based on stress level
    resourcesData.forEach(resource => {
        const cardHTML = createResourceCard(resource, language);
        if (resource.stressLevel === 'low') {
            lowContainer.innerHTML += cardHTML;
        } else if (resource.stressLevel === 'moderate') {
            moderateContainer.innerHTML += cardHTML;
        } else if (resource.stressLevel === 'high') {
            highContainer.innerHTML += cardHTML;
        }
    });
}

// Render the resources when the page first loads
document.addEventListener('DOMContentLoaded', renderResources);