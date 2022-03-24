
    // const host = 'https://730ff53a46d693.lhrtunnel.link'
    // const host = 'http://localhost:4000'
    const host = window.location.origin
    var slideIndexMP3 = 1;
    var slideIndexSearch = 1;
    var currentMenu = 'mp3'

    function searchYoutube() {
        let inputUrl = document.getElementById('searchYoutubeId').value
        const Http = new XMLHttpRequest();
        const baseUrl = host + '/search-youtube2?q='
        const url=baseUrl + inputUrl
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange = (e) => {
            if (e.currentTarget.readyState === 4) {
                let data = Http.responseText? JSON.parse(Http.responseText) : []
                // console.log('data===', data)
                let originNodeParent = document.getElementById('youtubeListsIdParent')
                if (data && data.items && data.items.length > 0) {
                    originNodeParent.setAttribute('style', 'overflow-y: auto;')
                } else {
                    return null
                }

                let temp = document.getElementById('youtubeListsId')
                if (temp) originNodeParent.removeChild(temp)
                
                let originNode = document.createElement('div')
                originNode.setAttribute('class', 'col-11 text-center m-2')
                originNode.setAttribute('id', 'youtubeListsId')
                originNodeParent.append(originNode)

                let count = 0
                let all = data.items.length
                for (let item of data.items) {
                    if (item['type'] === 'video') {
                        count += 1
                        let node012 = document.createElement("div");
                        node012.setAttribute('class', 'defaultHiddenSearch')

                        let id = item['id']
                        let imagePreview = item['thumbnail']['thumbnails'][0]['url']
                        let videoTitle = item['title']
                        let videoLength = item['length']? item['length']['simpleText'] : 'unknown'
    
                        let node0 = document.createElement("div");
                        node0.setAttribute('class', 'col-12 text-center mt-5 textOverFlow')
                        let node0txt = document.createTextNode(`[${count}/${all}]` + videoTitle + '(' + videoLength + ')')
                        node0.append(node0txt)
    
                        let node1 = document.createElement("div");
                        node1.setAttribute('class', 'col-12 text-center')
    
                        let node11 = document.createElement("img");
                        node11.setAttribute('width', '100%')
                        node11.setAttribute('height', '200px')
                        node11.setAttribute('src', imagePreview)
    
                        node1.append(node11)
    
                        let node2 = document.createElement("div");
                        node2.setAttribute('class', 'col-12 text-center')
                        node2.setAttribute('style', 'padding-top: 50px;')
    
                        let node22 = document.createElement('button')
                        node22.setAttribute('class', 'btn btn-primary m-1')
                        node22.setAttribute('onclick', 'convertVideo2Mp3("' + id + '")')
                        let node22txt = document.createTextNode('CV')
                        node22.append(node22txt)

                        let node33 = document.createElement('button')
                        node33.setAttribute('class', 'btn btn-primary m-1 btn-info')
                        node33.setAttribute('onclick', 'plusSlides(-1, "search")')
                        let node33txt = document.createTextNode('Back')
                        node33.append(node33txt)

                        let node44 = document.createElement('button')
                        node44.setAttribute('class', 'btn btn-primary m-1 btn-info')
                        node44.setAttribute('onclick', 'plusSlides(1, "search")')
                        let node44txt = document.createTextNode('Next')
                        node44.append(node44txt)
    
                        node2.append(node22)
                        node2.append(node33)
                        node2.append(node44)
    
                        node012.append(node0)
                        node012.append(node1)
                        node012.append(node2)

                        originNode.append(node012)
                    }
                }
                showSlides(1, 'search')


            }
            
        }


    }

    function convertVideo2Mp3(urlItem) {
        let inputUrl = urlItem || document.getElementById('urlInputId').value
        const Http = new XMLHttpRequest();
        const baseUrl = host + '/youtube2mp3?youtubeUrl='
        const url=baseUrl + inputUrl
        Http.open("GET", url);
        Http.send();

        Http.onreadystatechange = (e) => {
            console.log(Http.responseText)
            if (Http.responseText === true || Http.responseText === 'true') {
                document.getElementById('urlLableGreen').innerHTML = '(OK)'
                document.getElementById('urlLableRed').innerHTML = ''
            }
            else {
                document.getElementById('urlLableGreen').innerHTML = ''
                document.getElementById('urlLableRed').innerHTML = '(Error)'
            }
        }

    }

    function xoaFile(filename) {
        const Http = new XMLHttpRequest();
        const baseUrl = host + '/delete?filename='
        const url=baseUrl + filename
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange = (e) => {
            console.log(Http.responseText)
            location.reload();
        }
    }
    
    function fetchAllFiles() {
        const Http = new XMLHttpRequest();
        const baseUrl = host + '/listofmp3'
        const url=baseUrl
        showMenu(currentMenu)
        document.getElementById('menump3').click()
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange = (e) => {
            try {
                if (e.currentTarget.readyState === 4) {
                    let data = Http.responseText? JSON.parse(Http.responseText) : []
                    let originNode = document.getElementById('listOfFileId')
                    let count = 0
                    let all = data.length

                    for (let each of data) {
                        count += 1
                        let node = document.createElement('div')
                        node.setAttribute('class', 'defaultHidden row border-bottom border-primary m-1')
        
                        let node2 = document.createElement("div");
                        node2.setAttribute('class', 'col-9')
                        
                        // audio tag
                        let node2Vide0 = document.createElement('audio')
                        node2Vide0.setAttribute('autostart', 'false')
                        node2Vide0.setAttribute('preload', 'none')
                        node2Vide0.setAttribute('controls', 'controls')
                        node2Vide0.setAttribute('width', '100% !important')
                        node2Vide0.setAttribute('height', '25px')
                        node2Vide0.setAttribute('type', 'audio/mpeg')

                        // source tag
                        let node2Vide0Src = document.createElement('source')
                        node2Vide0Src.setAttribute('src', host + '/download?filename=' + each.file)
                        node2Vide0.append(node2Vide0Src)

                        node2.append(node2Vide0)
        
        
                        // a tag
                        let node3 = document.createElement("div");
                        node3.setAttribute('class', 'row text-center p-1')

                        let node3btndiv = document.createElement("div");
                        node3btndiv.setAttribute('class', 'col-3 text-center p-1')

                        let node3btn = document.createElement('button')
                        let node3btntxt = document.createTextNode('Xóa')
                        node3btn.append(node3btntxt)
                        node3btn.setAttribute('class', 'btn btn-danger m-1')
                        node3btn.setAttribute('onclick', 'xoaFile("' + each.file + '")')
                        node3btndiv.append(node3btn)    
                        
                        let node1 = document.createElement("div");
                        let node1Span = document.createElement('label')
                        let node1txt = document.createTextNode('[' + count + '/' + all +  '] '+ each.file.split('_').join(' ') + ' (' + parseFloat(each.size).toFixed(3) +' Mb)')
                        node1Span.append(node1txt)
                        node1.setAttribute('class', 'col-9 text-wrap labelOverflow')
                        node1.append(node1Span)
                        
                        node3.append(node1)
                        node3.append(node3btndiv)
        
                        node.append(node2)
                        node.append(node3)
                        originNode.append(node)
                    }

                    showSlides(1, 'list')
                }
            } catch (err) {
                console.log(err)
            }
        }
    }

    // Next/previous controls
    function plusSlides(n, option) {
        if (option === 'list') showSlides(slideIndexMP3 += n, option);
        if (option === 'search') showSlides(slideIndexSearch += n, option);
    }

    function showSlides(n, option) {
        // var i;
        // var className = "defaultHidden"
        // if (option === 'list') className = "defaultHidden"
        // if (option === 'search') className = "defaultHiddenSearch"

        // var slides = document.getElementsByClassName(className);
        // if (slides.length > 0) {
        //     if (n > slides.length) {
        //         if (option === 'list') slideIndexMP3 = 1
        //         if (option === 'search') slideIndexSearch = 1
        //     }
        //     if (n < 1) {
        //         if (option === 'list') slideIndexMP3 = slides.length
        //         if (option === 'search') slideIndexSearch = slides.length
        //     }
        //     for (i = 0; i < slides.length; i++) {
        //         slides[i].style.display = "block";
        //     }

        //     if (option === 'list') slides[slideIndexMP3-1].style.display = "block";
        //     if (option === 'search') slides[slideIndexSearch-1].style.display = "block";
        // }
    }
function showMenu(menu) {
        currentMenu = menu
        document.getElementById('mp3').style.display = 'none'
        document.getElementById('youtube').style.display = 'none'
        document.getElementById(currentMenu).style.display = ''
}
