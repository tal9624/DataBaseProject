export async function getData(){
    const res = await fetch('/data');
    const data = await res.json();
    const list = document.getElementById('dataList');
    data.forEach(item => {
        let li = document.createElement('li');
        li.textContent = `${item.name}: ${item.value}`;
        list.appendChild(li);
    });
}