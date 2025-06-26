// discografia.js

// Constante com a chave usada no localStorage
// Esta chave identifica onde nossos dados serão armazenados
const STORAGE_KEY = 'discografia_app_albuns';

// Função principal que é executada quando o DOM está carregado
document.addEventListener('DOMContentLoaded', function() {
    // Referências aos elementos do formulário
    const albumForm = document.getElementById('albumForm');
    const titleInput = document.getElementById('title');
    const artistInput = document.getElementById('artist');
    const yearInput = document.getElementById('year');
    const genreInput = document.getElementById('genre');
    const albumIdInput = document.getElementById('albumId');
    const cancelBtn = document.getElementById('cancelBtn');
    const albumsContainer = document.getElementById('albumsContainer');
    
    // Variável para controlar se estamos editando um álbum
    let isEditing = false;
    let currentAlbumId = null;
    
    // Carrega os álbuns quando a página é aberta
    loadAlbums();
    
    // Event listener para o formulário
    albumForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Previne o comportamento padrão de submit
        
        // Obtém os valores dos inputs
        const title = titleInput.value.trim();
        const artist = artistInput.value.trim();
        const year = parseInt(yearInput.value);
        const genre = genreInput.value.trim();
        
        // Validação básica
        if (!title || !artist || !year) {
            alert('Por favor, preencha todos os campos obrigatórios!');
            return;
        }
        
        // Cria o objeto do álbum
        const album = {
            id: isEditing ? currentAlbumId : Date.now(), // Usa o ID existente ou cria um novo
            title,
            artist,
            year,
            genre
        };
        
        // Salva o álbum
        saveAlbum(album);
        
        // Limpa o formulário
        resetForm();
        
        // Recarrega a lista de álbuns
        loadAlbums();
    });
    
    // Event listener para o botão cancelar
    cancelBtn.addEventListener('click', resetForm);
    
    // Função para carregar os álbuns do localStorage e exibi-los
    function loadAlbums() {
        // Obtém os álbuns do localStorage
        const albums = getAlbums();
        
        // Limpa o container
        albumsContainer.innerHTML = '';
        
        // Verifica se há álbuns
        if (albums.length === 0) {
            albumsContainer.innerHTML = '<p>Nenhum álbum cadastrado ainda.</p>';
            return;
        }
        
        // Para cada álbum, cria um elemento HTML
        albums.forEach(album => {
            const albumElement = document.createElement('div');
            albumElement.className = 'album-item';
            albumElement.innerHTML = `
                <div>
                    <strong>${album.title}</strong> - ${album.artist} (${album.year})
                    ${album.genre ? `<br><small>Gênero: ${album.genre}</small>` : ''}
                </div>
                <div>
                    <button onclick="editAlbum(${album.id})">Editar</button>
                    <button onclick="deleteAlbum(${album.id})">Excluir</button>
                </div>
            `;
            albumsContainer.appendChild(albumElement);
        });
    }
    
    // Função para obter todos os álbuns do localStorage
    function getAlbums() {
        // Obtém os dados do localStorage usando a chave definida
        const albumsJSON = localStorage.getItem(STORAGE_KEY);
        
        // Se não houver dados, retorna um array vazio
        // Caso contrário, converte o JSON para objeto JavaScript
        return albumsJSON ? JSON.parse(albumsJSON) : [];
    }
    
    // Função para salvar um álbum (adicionar novo ou atualizar existente)
    function saveAlbum(album) {
        // Obtém todos os álbuns
        const albums = getAlbums();
        
        if (isEditing) {
            // Encontra o índice do álbum que está sendo editado
            const index = albums.findIndex(a => a.id === album.id);
            
            // Se encontrou, substitui o álbum antigo pelo novo
            if (index !== -1) {
                albums[index] = album;
            }
        } else {
            // Adiciona o novo álbum ao array
            albums.push(album);
        }
        
        // Salva o array atualizado no localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
    }
    
    // Função para resetar o formulário
    function resetForm() {
        albumForm.reset();
        isEditing = false;
        currentAlbumId = null;
        albumIdInput.value = '';
    }
    
    // Função para editar um álbum (exposta no escopo global para ser chamada do HTML)
    window.editAlbum = function(id) {
        // Obtém todos os álbuns
        const albums = getAlbums();
        
        // Encontra o álbum com o ID especificado
        const albumToEdit = albums.find(album => album.id === id);
        
        if (albumToEdit) {
            // Preenche o formulário com os dados do álbum
            isEditing = true;
            currentAlbumId = id;
            albumIdInput.value = id;
            titleInput.value = albumToEdit.title;
            artistInput.value = albumToEdit.artist;
            yearInput.value = albumToEdit.year;
            genreInput.value = albumToEdit.genre || '';
            
            // Rolagem suave até o formulário
            document.querySelector('.album-form').scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    // Função para excluir um álbum (exposta no escopo global para ser chamada do HTML)
    window.deleteAlbum = function(id) {
        // Confirmação antes de excluir
        if (!confirm('Tem certeza que deseja excluir este álbum?')) {
            return;
        }
        
        // Obtém todos os álbuns
        const albums = getAlbums();
        
        // Filtra o array, removendo o álbum com o ID especificado
        const updatedAlbums = albums.filter(album => album.id !== id);
        
        // Atualiza o localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAlbums));
        
        // Recarrega a lista de álbuns
        loadAlbums();
        
        // Se estava editando o álbum excluído, reseta o formulário
        if (isEditing && currentAlbumId === id) {
            resetForm();
        }
    };
});