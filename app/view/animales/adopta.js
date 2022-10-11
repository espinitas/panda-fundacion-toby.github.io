import { conejito } from '../../main/src/panda/conejito.js';
import { hideModal } from '../../main/src/panda/extensions/bt.js';
import { replaceViewHistory } from '../../main/src/panda/navigation/polar.js';
import { datosPerritos } from './galerias/datosPerritos.js';
import { TIPO_ADOPCION } from './galerias/filtrosTipoAdopcion.js';
const { createApp } = Vue;

// conejito.onBeforeNavigate(() => {
//     $('#perritoModal').modal('hide');
// });

datosPerritos.load([TIPO_ADOPCION.DISPONIBLE]).then(() => {
    const adoptaAppElement = document.getElementById('adopta-app');
    const currentPage = 0;
    const pageSize = 500;
    let navigateTo = null;
    const app = createApp({
        data() {
            return {
                total: datosPerritos.count(),
                cards: datosPerritos.getCards(currentPage, pageSize),
                currentPage: 0,
                pageSize: 3,
                vanish: false,
                ready: true,
                currentDog: {},
            }
        },
        methods: {
            previousPage() {
                this.currentPage--;
                this.cards = datosPerritos.getCards(this.currentPage, pageSize);
            },
            nextPage() {
                this.currentPage++;
                this.cards = datosPerritos.getCards(this.currentPage, pageSize);
            },
            showPhoto(key) {
                const found = datosPerritos.cards.find(c => c.key === key);
                if (!found) {
                    return;
                }
                this.currentDog = found;
                this.currentDog.showLoading(true);
                $('#perritoModal').modal('toggle');
                replaceViewHistory(`#/animales/adopta/${key}`);
            },
            preview() {
                this.currentDog.previous();
            },
            next() {
                this.currentDog.next();
            },
            async navigateToDonaciones(event) {
                // $('#perritoModal').modal('hide');
                await hideModal(document.getElementById('perritoModal'));
                alert(1);
            }
        },
        mounted() {
            const modalImg = document.getElementById('adopta-modal-img');
            modalImg.addEventListener('load', () => {
                this.currentDog.showLoading(false);
            });
            modalImg.addEventListener('swiped', (e) => {
                if (e.detail.dir === 'left') {
                    this.currentDog.next();
                } else if (e.detail.dir === 'right') {
                    this.currentDog.previous();
                }
            });
            $('#perritoModal').on('hidden.bs.modal', function (e) {
                // if (navigateTo) {
                //     conejito.loadCentralView(navigateTo);
                //     navigateTo = null;
                // } else {
                // replaceView('#/animales/adopta');
                // }
            });
            document.onkeydown = (e) => {
                if (!this.currentDog) {
                    return;
                }
                switch (e.key) {
                    case 'ArrowLeft':
                        this.currentDog.previous();
                        break;
                    case 'ArrowRight':
                        this.currentDog.next();
                        break;
                    default: return;
                }
            };
            if (conejito.tenebrito.queryString) {
                this.showPhoto(parseInt(conejito.tenebrito.queryString));
                const cardElement = document.getElementById(`card-${conejito.tenebrito.queryString}`);
                if (cardElement) {
                    cardElement.scrollIntoView(true);
                }
            }
        }
    }).mount(adoptaAppElement);
    adoptaAppElement.classList.remove('adopta-init');
}).catch(error => {
    console.trace(error);
    const elements = document.getElementsByClassName('cargando');
    Array.from(elements).forEach(e => {
        e.classList.add('app-hide');
    });
});