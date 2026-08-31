function sum(a,b){
    return a + b;

}

function sumWithMsg(clbk,msg){

    const result = clbk(10,20);
    const fresult="hi" + msg + "the sum is" + result;
    console.log(fresult);
}

sumWithMsg(sum,"Mr. Prateek");